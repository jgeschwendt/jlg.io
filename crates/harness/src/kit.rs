//! Building blocks for a coverage-collecting e2e suite: interaction primitives
//! that prove they stayed client-side, response-layer probes over in-page
//! fetch, and the Istanbul harvest/write path `scripts/coverage-report.ts`
//! consumes. Everything here panics on failure — these compose into suite
//! binaries whose unwinding is what takes the owned `Server` down (see
//! `server.rs`), not into a library API that reports errors upward.
//!
//! What deliberately does NOT live here: the route assertions themselves. A
//! suite's `main.rs` staying plain, repo-specific Rust is the design — the
//! readable statement of what that app must do.

use crate::Session;
use serde_json::Value;
use std::path::Path;
use std::time::{Duration, Instant};

// Hydration is a race, not an event we can wait on: next/link's handler is
// attached before the router can act, so a click can land in the gap and do
// nothing at all. Retry the click-and-check as a unit.
const SPA_TIMEOUT: Duration = Duration::from_secs(30);

pub struct FetchProbe {
    pub body: String,
    pub cache_control: String,
    pub content_type: String,
    pub csp: String,
    pub status: u16,
}

/// Reads an element's attribute, panicking when the element is missing.
pub fn attribute(session: &Session, selector: &str, name: &str) -> String {
    let script = format!("document.querySelector('{selector}')?.getAttribute('{name}') ?? null");
    session
        .eval(&script)
        .expect("read attribute")
        .as_str()
        .unwrap_or_else(|| panic!("no {selector} with a {name} attribute"))
        .to_string()
}

/// One history pop, then the same sentinel check as a click: a back that
/// reloads the document would discard the heap — and the counters — exactly
/// like an unhydrated anchor would.
pub fn back_until(session: &Session, path: &str) {
    session
        .eval("window.__harness = true")
        .expect("mark the document");
    session.back().expect("history back");

    let deadline = Instant::now() + SPA_TIMEOUT;
    loop {
        let at = session.eval("location.pathname").expect("read location");
        if at.as_str() == Some(path) {
            break;
        }
        assert!(
            Instant::now() < deadline,
            "history back never reached {path} (still at {at})"
        );
        std::thread::sleep(Duration::from_millis(250));
    }

    assert_eq!(
        session.eval("window.__harness === true").expect("sentinel"),
        Value::Bool(true),
        "history back reached {path} by a full page load, not the router"
    );
}

/// Clicks `selector` until the location settles on `to`. `HTMLElement.click`
/// dispatches an untrusted event, which React's synthetic handlers accept and
/// next/link's `preventDefault` still fires on — so this is a genuine
/// client-side navigation, not a disguised `location.assign`.
pub fn click_until(session: &Session, base: &str, selector: &str, from: &str, to: &str) {
    let script = format!(
        "(() => {{ const el = document.querySelector('{selector}'); \
         if (el) el.click(); return location.pathname; }})()"
    );
    settle(session, base, &script, from, to, selector);
}

pub fn count(session: &Session, selector: &str) -> u64 {
    session
        .eval(&format!("document.querySelectorAll('{selector}').length"))
        .expect("count elements")
        .as_u64()
        .expect("count is a number")
}

/// What the browser is actually looking at, for a failing assertion's autopsy:
/// URL, ready state, title, and the head of the live DOM. Diagnostics only —
/// nothing here is an assertion.
pub fn dump(session: &Session, context: &str) {
    let state = session
        .eval(
            "JSON.stringify({ href: location.href, readyState: document.readyState, \
             title: document.title, html: document.documentElement.outerHTML.slice(0, 600) })",
        )
        .map(|v| v.as_str().unwrap_or_default().to_string())
        .unwrap_or_else(|e| format!("dump eval failed: {e}"));
    println!("[harness] dump ({context}): {state}");
}

/// One same-origin fetch, reported whole. `evaluate` awaits the promise and
/// returns by value, so the status, the headers a suite asserts, and the body
/// come back in a single round trip — and a same-origin `Response` hides
/// nothing but `Set-Cookie`.
pub fn fetch_probe(session: &Session, path: &str) -> FetchProbe {
    let script = format!(
        "fetch('{path}', {{ cache: 'no-store' }}).then(async (r) => JSON.stringify({{ \
           body: await r.text(), \
           cacheControl: r.headers.get('cache-control') ?? '', \
           contentType: r.headers.get('content-type') ?? '', \
           csp: r.headers.get('content-security-policy') ?? '', \
           status: r.status }}))"
    );
    let raw = session.eval(&script).expect("fetch probe");
    let raw = raw.as_str().expect("probe reply is a JSON string");
    let value: Value = serde_json::from_str(raw).unwrap_or_else(|e| panic!("{path} probe: {e}"));

    FetchProbe {
        body: value["body"].as_str().unwrap_or_default().to_string(),
        cache_control: value["cacheControl"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        content_type: value["contentType"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        csp: value["csp"].as_str().unwrap_or_default().to_string(),
        status: u16::try_from(value["status"].as_u64().unwrap_or(0)).unwrap_or(0),
    }
}

/// Reads `window.__coverage__` and files it under `.nyc_output`. Every hard
/// navigation discards the map, so this has to run before the next one — client
/// coverage is not cumulative across page loads the way the server's is.
pub fn harvest(session: &Session, output: &Path, label: &str) -> (String, usize) {
    let raw = session
        .eval("JSON.stringify(window.__coverage__ ?? {})")
        .expect("read window.__coverage__");
    let raw = raw.as_str().expect("coverage map is a JSON string");
    write_map(output, &format!("client-harness-{label}"), raw, true)
}

/// `dev` unless COVERAGE_MODE or `--mode` says `prod`.
pub fn mode() -> String {
    let mut args = std::env::args().skip(1);
    let mut mode = std::env::var("COVERAGE_MODE").unwrap_or_else(|_| "dev".to_string());
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--mode" => mode = args.next().unwrap_or(mode),
            other => {
                if let Some(value) = other.strip_prefix("--mode=") {
                    mode = value.to_string();
                }
            }
        }
    }
    assert!(
        matches!(mode.as_str(), "dev" | "prod"),
        "mode must be dev or prod, got {mode:?}"
    );
    mode
}

/// The `'nonce-…'` value out of a policy's script-src. Base64ish by
/// construction, so everything up to the closing quote is the nonce.
pub fn nonce_of(csp: &str, path: &str) -> String {
    let start = csp
        .find("'nonce-")
        .unwrap_or_else(|| panic!("{path}: no nonce in CSP: {csp:?}"))
        + "'nonce-".len();
    let rest = &csp[start..];
    let end = rest
        .find('\'')
        .unwrap_or_else(|| panic!("{path}: unterminated nonce in CSP: {csp:?}"));
    rest[..end].to_string()
}

pub fn press_escape_until(session: &Session, base: &str, from: &str, to: &str) {
    let script = "(() => { document.dispatchEvent(new KeyboardEvent('keydown', \
                  { bubbles: true, key: 'Escape' })); return location.pathname; })()";
    settle(session, base, script, from, to, "Escape");
}

/// The server's cumulative map, read while the browser is still on a
/// same-origin document: `evaluate` awaits promises, so the fetch resolves
/// before the reply comes back and the run needs no HTTP client of its own.
/// Asserts the `/api/coverage` contract on the way: 200, never cached.
pub fn server_coverage(session: &Session, output: &Path) -> (String, usize) {
    let probe = fetch_probe(session, "/api/coverage");
    assert_eq!(probe.status, 200, "/api/coverage status");
    assert!(
        probe.cache_control.contains("no-store"),
        "/api/coverage cache-control: {:?}",
        probe.cache_control
    );
    write_map(output, "server-harness", &probe.body, false)
}

/// Repeats `script` until it reports `to`, then proves the move was
/// client-side. The sentinel is a plain property of the JS heap, so it survives
/// a router push and dies with a full page load — the same thing that would
/// silently discard every counter accumulated since the last harvest. Without
/// this check an unhydrated anchor following its own `href` would look exactly
/// like a successful hydration test.
///
/// A full-load arrival gets bounded retries rather than an immediate panic: in
/// dev, Turbopack finishing an entry compile mid-navigation reloads the page —
/// environmental, not an app regression, and only ever seen on a cold CI
/// runner where nothing is precompiled. Each retry returns to `from`, waits
/// for hydration, and reruns the interaction; a genuine regression fails every
/// attempt. (observed 2026-08-18 · runs 32166774728, 32167373217)
pub fn settle(session: &Session, base: &str, script: &str, from: &str, to: &str, what: &str) {
    const ATTEMPTS: u32 = 3;

    for attempt in 1..=ATTEMPTS {
        session
            .eval("window.__harness = true")
            .expect("mark the document");

        let deadline = Instant::now() + SPA_TIMEOUT;
        loop {
            let at = session.eval(script).expect("client-side navigation");
            if at.as_str() == Some(to) {
                break;
            }
            assert!(
                Instant::now() < deadline,
                "{what} never reached {to} (still at {at})"
            );
            std::thread::sleep(Duration::from_millis(250));
        }

        if session.eval("window.__harness === true").expect("sentinel") == Value::Bool(true) {
            return;
        }

        println!("[harness] {what}: {to} arrived by full page load (attempt {attempt}), retrying");
        session
            .navigate(&format!("{base}{from}"))
            .expect("return to the interaction's origin");
        wait_hydrated(session, "a");
    }

    panic!(
        "{what} reached {to} only by full page loads across {ATTEMPTS} attempts — \
         the coverage from the previous page is gone"
    );
}

pub fn strings(session: &Session, script: &str) -> Vec<String> {
    session
        .eval(script)
        .expect("read strings")
        .as_array()
        .expect("script returned an array")
        .iter()
        .map(|value| value.as_str().unwrap_or_default().trim().to_string())
        .collect()
}

/// `textContent`, not `innerText`: a page animating in from `opacity: 0` makes
/// `innerText` — which is layout-aware — return nothing for content the
/// entrance has not revealed yet.
pub fn text(session: &Session, selector: &str) -> String {
    let script = format!("document.querySelector('{selector}')?.textContent ?? null");
    session
        .eval(&script)
        .expect("read text")
        .as_str()
        .unwrap_or_else(|| panic!("no element matching {selector}"))
        .trim()
        .to_string()
}

/// Blocks until `selector`'s element is itself hydrated. An anchor clicked
/// before hydration follows its own `href` — a full page load that lands on the
/// right URL while silently discarding every counter since the last harvest,
/// which is exactly what the settle() sentinel exists to catch. Waiting here
/// turns that sentinel from a race into a pure assertion.
///
/// The marker is the `__reactFiber$…` key React stamps on a DOM node when it
/// hydrates that node — not `window.next.router`, which the runtime installs
/// BEFORE the tree hydrates: on a slow cold-compile machine the gap between the
/// two is wide enough for a click to fall through to native navigation.
/// (observed 2026-08-18 · run 32166774728: the router marker passed, the click
/// full-loaded anyway on the CI runner; never seen locally)
pub fn wait_hydrated(session: &Session, selector: &str) {
    let script = format!(
        "(() => {{ const el = document.querySelector('{selector}'); return Boolean(el && \
         Object.keys(el).some((k) => k.startsWith('__reactFiber'))); }})()"
    );
    let deadline = Instant::now() + SPA_TIMEOUT;
    loop {
        let hydrated = session.eval(&script).expect("probe hydration");
        if hydrated == Value::Bool(true) {
            return;
        }
        assert!(
            Instant::now() < deadline,
            "{selector} never hydrated — no React fiber attached"
        );
        std::thread::sleep(Duration::from_millis(250));
    }
}

/// `tolerate_empty` is for the client maps: a route that ships no Client
/// Components legitimately has none, and failing there would make the harness
/// brittle about which routes happen to be interactive. An empty *server* map
/// means the instrumentation is dead, which must be loud.
pub fn write_map(output: &Path, name: &str, raw: &str, tolerate_empty: bool) -> (String, usize) {
    let map: Value = serde_json::from_str(raw).unwrap_or_else(|e| panic!("{name}: {e}"));
    let files = map.as_object().map_or(0, serde_json::Map::len);

    assert!(
        files > 0 || tolerate_empty,
        "{name}: coverage map is empty — is COVERAGE=1 reaching the server?"
    );

    if files > 0 {
        let path = output.join(format!("coverage-{name}.json"));
        std::fs::write(&path, raw).unwrap_or_else(|e| panic!("write {}: {e}", path.display()));
    }

    (name.to_string(), files)
}
