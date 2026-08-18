//! `Page.setBypassCSP`, held open for the life of a run.
//!
//! Instrumented modules open with `new (function(){}).constructor("return this")()`
//! — an obfuscated `new Function` — and the production `script-src` carries no
//! `'unsafe-eval'`, so under enforcement an instrumented bundle throws an
//! `EvalError` before hydration and `window.__coverage__` is never created.
//! Disabling enforcement in the browser keeps the app's real policy on the
//! wire instead of weakening what the server sends — and the coverage runner
//! asserts that wire policy (nonce and all) itself, which is the check browser
//! enforcement would otherwise have been.
//!
//! `src/server/proxy/content-security-policy.ts` does grant `'unsafe-eval'`
//! when `NODE_ENV` is development, so this only bites in `--mode prod`. It is
//! armed unconditionally anyway: the dev grant is incidental to a policy the
//! app owns for its own reasons, and a coverage run that silently depends on it
//! would break on the day it is tightened. (verified 2026-08-18 · the dev
//! server's response header carries `'unsafe-eval'`, `next start`'s does not)
//!
//! The override is scoped to the CDP session that set it and reverts the moment
//! that session detaches, so this type owns the WebSocket and must outlive
//! every navigation the run performs. Arm it before the first request to the
//! app; a page loaded under enforcement stays broken even if the bypass lands
//! a moment later.

use serde_json::{Value, json};
use std::net::TcpStream;
use std::time::Duration;
use tungstenite::stream::MaybeTlsStream;
use tungstenite::{Message, WebSocket};

const TIMEOUT: Duration = Duration::from_secs(20);

pub struct Bypass {
    next_id: u64,
    socket: WebSocket<MaybeTlsStream<TcpStream>>,
}

impl Bypass {
    /// `cdp_url` is the browser-level endpoint from the daemon's `cdp_url`
    /// action. Attaching flat (`flatten: true`) multiplexes the page session
    /// onto this one connection, so a single socket carries both the target
    /// lookup and the per-page commands.
    pub fn arm(cdp_url: &str) -> Result<Self, String> {
        let (socket, _) = tungstenite::connect(cdp_url).map_err(|e| format!("connect: {e}"))?;
        let mut bypass = Bypass { next_id: 1, socket };

        // A read timeout rather than a blocking read: a CDP command that never
        // answers would otherwise hang the run with the dev server and a
        // browser both still up.
        if let MaybeTlsStream::Plain(stream) = bypass.socket.get_mut() {
            stream
                .set_read_timeout(Some(TIMEOUT))
                .map_err(|e| format!("set read timeout: {e}"))?;
        }

        // EVERY page target, not the first: which target the daemon actually
        // drives is not knowable from here, and a headless browser can open
        // with more than one page in nondeterministic order. Arming the wrong
        // one leaves enforcement live, the instrumented bundle dies on its
        // `new Function`, and React 19's hydration crash swaps the document
        // for the `__next_error__` shell — while a plain fetch of the same URL
        // is perfectly healthy, because nothing executes.
        // (observed 2026-08-18 · the ci prod-gate hunt: runs failed or passed
        // by coin flip until the shell autopsy showed healthy fetch bodies)
        let targets = bypass.command("Target.getTargets", json!({}), None)?;
        let target_ids: Vec<String> = targets["targetInfos"]
            .as_array()
            .ok_or("Target.getTargets returned no targetInfos")?
            .iter()
            .filter(|info| info["type"] == "page")
            .filter_map(|info| info["targetId"].as_str().map(str::to_string))
            .collect();
        if target_ids.is_empty() {
            return Err("no page target attached to the browser".to_string());
        }

        for target_id in &target_ids {
            let attached = bypass.command(
                "Target.attachToTarget",
                json!({ "flatten": true, "targetId": target_id }),
                None,
            )?;
            let session = attached["sessionId"]
                .as_str()
                .ok_or("attachToTarget returned no sessionId")?
                .to_string();

            // `Page.setBypassCSP` is only honoured on a domain-enabled page.
            bypass.command("Page.enable", json!({}), Some(&session))?;
            bypass.command(
                "Page.setBypassCSP",
                json!({ "enabled": true }),
                Some(&session),
            )?;
        }
        println!(
            "[harness] CSP bypass armed on {} page target(s)",
            target_ids.len()
        );

        Ok(bypass)
    }

    /// Sends one command and returns its `result`, discarding the CDP events
    /// that arrive interleaved with replies — `Page.enable` alone turns the
    /// connection into a firehose of lifecycle events.
    fn command(
        &mut self,
        method: &str,
        params: Value,
        session: Option<&str>,
    ) -> Result<Value, String> {
        let id = self.next_id;
        self.next_id += 1;

        let mut request = json!({ "id": id, "method": method, "params": params });
        if let Some(session) = session {
            request["sessionId"] = json!(session);
        }

        self.socket
            .send(Message::text(request.to_string()))
            .map_err(|e| format!("{method}: send: {e}"))?;

        loop {
            let message = self
                .socket
                .read()
                .map_err(|e| format!("{method}: read: {e}"))?;
            let Message::Text(text) = message else {
                continue;
            };
            let reply: Value =
                serde_json::from_str(&text).map_err(|e| format!("{method}: decode: {e}"))?;

            if reply["id"].as_u64() != Some(id) {
                continue;
            }
            if let Some(error) = reply.get("error") {
                return Err(format!("{method}: {error}"));
            }
            return Ok(reply["result"].clone());
        }
    }
}

impl Drop for Bypass {
    fn drop(&mut self) {
        // Best effort: the browser is about to be told to close anyway, and a
        // failure here would mask whatever actually ended the run.
        let _ = self.socket.close(None);
        let _ = self.socket.flush();
    }
}
