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

// Reads the tap's buffer out of `sessionStorage`, empties it, and reports how
// the CURRENT document was entered — after a full-load fallback that is the new
// document, whose navigation type ("navigate" for a link the router let through
// to the browser, "reload" for a genuine reload) separates the two stories.
const RSC_DRAIN: &str = "(() => { const KEY = '__harness_rsc'; let log = []; \
     try { log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {} \
     try { sessionStorage.removeItem(KEY); } catch (e) {} \
     const nav = performance.getEntriesByType('navigation')[0]; \
     return JSON.stringify({ entries: log, navigation: nav ? nav.type : null, \
       tapped: Boolean(window.__harness_rsc_tapped) }); })()";

// `sessionStorage`, not a `window` property, is the whole point: it is the one
// place a record written before a full page load can still be read after it,
// and it is per-origin-per-tab, so a run never reads another's entries.
const RSC_TAP: &str = "(() => { \
     if (window.__harness_rsc_tapped) return false; \
     window.__harness_rsc_tapped = true; \
     const KEY = '__harness_rsc'; \
     const LIMIT = 20; \
     const record = (entry) => { try { \
       const log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); \
       log.push(entry); \
       sessionStorage.setItem(KEY, JSON.stringify(log.slice(-LIMIT))); \
     } catch (e) {} }; \
     const rscHeader = (input, init) => { \
       const headers = (init && init.headers) \
         || (input && typeof input === 'object' ? input.headers : null); \
       if (!headers) return false; \
       try { \
         if (typeof headers.get === 'function') return headers.get('RSC') === '1'; \
         if (Array.isArray(headers)) \
           return headers.some((pair) => String(pair[0]).toLowerCase() === 'rsc'); \
         return Object.keys(headers).some((key) => key.toLowerCase() === 'rsc'); \
       } catch (e) { return false; } \
     }; \
     const original = window.fetch; \
     window.fetch = function (input, init) { \
       const url = typeof input === 'string' ? input : (input && input.url) || String(input); \
       const watched = String(url).includes('_rsc=') || rscHeader(input, init); \
       const pending = original.apply(this, arguments); \
       if (!watched) return pending; \
       let path = String(url); \
       try { const parsed = new URL(String(url), location.href); \
         path = parsed.pathname + parsed.search; } catch (e) {} \
       const at = Date.now(); \
       return pending.then((response) => { \
         const nextjs = {}; \
         try { response.headers.forEach((value, name) => { \
           if (name.indexOf('x-nextjs-') === 0) nextjs[name] = value; }); } catch (e) {} \
         const header = (name) => { \
           try { return response.headers.get(name) || ''; } catch (e) { return ''; } }; \
         record({ at, contentType: header('content-type'), nextjs, path, \
           status: response.status, type: response.type, url: String(url), \
           xMatchedPath: header('x-matched-path'), xVercelCache: header('x-vercel-cache'), \
           xVercelId: header('x-vercel-id') }); \
         return response; \
       }, (error) => { \
         record({ at, error: String(error), path, url: String(url) }); \
         throw error; \
       }); \
     }; \
     return true; })()";

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

/// Wraps `window.fetch` for the rest of the document's life so an App Router
/// navigation fetch leaves evidence that OUTLIVES the page. A `<Link>` click
/// degrades to a full page load when the RSC fetch for the target does not come
/// back as an RSC payload — a non-`text/x-component` content type, an error
/// page, a cross-origin redirect, a build/deployment-id mismatch — and the
/// reload that follows wipes the page before anything can be asked about it.
/// The record goes to `sessionStorage`, which survives a same-origin reload, so
/// `print_rsc_log` can read it out of the NEW document. Same-origin responses
/// hide no headers, so the Vercel routing trail (`x-vercel-id`,
/// `x-vercel-cache`, `x-matched-path`, any `x-nextjs-*`) comes back alongside
/// the status. Idempotent per document via `window.__harness_rsc_tapped`;
/// diagnostics only, and a rejected fetch is re-thrown untouched.
pub fn arm_rsc_tap(session: &Session) {
    session.eval(RSC_TAP).expect("arm the RSC tap");
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
    arm_rsc_tap(session);
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

    let client_side =
        session.eval("window.__harness === true").expect("sentinel") == Value::Bool(true);
    if !client_side {
        print_rsc_log(session, &format!("history back to {path}, full page load"));
    }
    assert!(
        client_side,
        "history back reached {path} by a full page load, not the router"
    );
}

/// The origin a run drives instead of one it started itself: `--base <url>` or
/// `--base=<url>` on the command line, else `HARNESS_BASE`. `None` is the
/// default and means the suite owns its own `Server` — a deployment has no
/// instrumentation to collect, so what a caller does with `Some` is its own
/// business, not this module's. One trailing `/` comes off so `{base}/path`
/// composes the same way either answer arrives.
pub fn base_url() -> Option<String> {
    let mut args = std::env::args().skip(1);
    let mut base = std::env::var("HARNESS_BASE").ok();
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--base" => base = args.next().or(base),
            other => {
                if let Some(value) = other.strip_prefix("--base=") {
                    base = Some(value.to_string());
                }
            }
        }
    }
    base.map(|mut url| {
        if url.ends_with('/') {
            url.pop();
        }
        url
    })
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

/// A hard navigation that trusts nothing: not the daemon's load wait (against
/// an instant server the load event can fire before the daemon's listener is
/// armed, returning mid-document-swap), and not the rendered document either —
/// settle on `url` with a complete document, then retry with the evidence
/// printed if Next's `<html id="__next_error__">` shell answered; a persistent
/// failure still exhausts the attempts. The one shell outbreak investigated so
/// far was a harness bug (the CSP bypass armed on the wrong page target — see
/// `cdp.rs`), so a recurrence showing up here deserves suspicion of the
/// tooling before the app. (reconciled 2026-08-18 · PR #570: healthy fetch
/// bodies alongside shell navigations ruled the server out)
pub fn goto(session: &Session, url: &str) {
    const ATTEMPTS: u32 = 5;

    for attempt in 1..=ATTEMPTS {
        session.navigate(url).expect("navigate");

        let deadline = Instant::now() + SPA_TIMEOUT;
        loop {
            let state = session
                .eval("JSON.stringify({ href: location.href, ready: document.readyState })")
                .expect("probe navigation");
            let state = state.as_str().unwrap_or_default();
            if state.contains(&format!("\"href\":\"{url}\""))
                && state.contains("\"ready\":\"complete\"")
            {
                break;
            }
            assert!(Instant::now() < deadline, "never settled on {url}: {state}");
            std::thread::sleep(Duration::from_millis(100));
        }

        let shell = session
            .eval("document.documentElement.id === '__next_error__'")
            .expect("probe error shell");
        if shell != Value::Bool(true) {
            // Armed here, not only at the interactions, so the app's own
            // prefetches are caught: a `<Link>` in view fetches its RSC payload
            // long before any click, and a prefetch that came back wrong is the
            // likeliest reason a later click degrades to a full page load.
            arm_rsc_tap(session);
            return;
        }

        dump(session, &format!("error shell on {url}, attempt {attempt}"));
        print_rsc_log(session, &format!("error shell on {url}, attempt {attempt}"));
        // The navigated document and a fresh fetch of the same URL can tell
        // different stories (PR #570: fetch healthy, navigation crashed), so
        // report both sides and keep the whole body in .nyc_output, which the
        // CI job uploads as an artifact on failure.
        let probe = fetch_probe(session, url);
        let refetch_shell = probe.body.contains("__next_error__");
        let head = probe.body.chars().take(200).collect::<String>();
        println!(
            "[harness] refetch {url}: status {}, csp {} chars, {} bytes, shell {refetch_shell}, head: {head:?}",
            probe.status,
            probe.csp.len(),
            probe.body.len()
        );
        let _ = std::fs::write(
            format!(".nyc_output/debug-shell-attempt{attempt}.html"),
            &probe.body,
        );
        std::thread::sleep(Duration::from_millis(500));
    }

    panic!("{url} served the __next_error__ shell across {ATTEMPTS} attempts");
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

/// Drains `arm_rsc_tap`'s buffer to stdout, one `rsc` line per navigation
/// fetch, plus how the current document was entered. Diagnostics only — it
/// asserts nothing, never panics on a missing tap, and empties the buffer so
/// the next report carries only what happened since.
pub fn print_rsc_log(session: &Session, context: &str) {
    let raw = match session.eval(RSC_DRAIN) {
        Ok(value) => value.as_str().unwrap_or_default().to_string(),
        Err(e) => {
            println!("[harness] rsc log ({context}): unavailable: {e}");
            return;
        }
    };
    let report: Value = serde_json::from_str(&raw).unwrap_or(Value::Null);
    let entries = report["entries"].as_array().cloned().unwrap_or_default();
    println!(
        "[harness] rsc log ({context}): {} navigation fetch(es), navigation type {}, tapped {}",
        entries.len(),
        report["navigation"].as_str().unwrap_or("unknown"),
        report["tapped"].as_bool().unwrap_or(false),
    );
    for entry in entries {
        let path = entry["path"].as_str().unwrap_or("?");
        if let Some(error) = entry["error"].as_str() {
            println!("[harness]   rsc {path} rejected: {error}");
            continue;
        }
        let nextjs = entry["nextjs"]
            .as_object()
            .filter(|headers| !headers.is_empty())
            .map(|headers| format!(" x-nextjs {}", Value::Object(headers.clone())))
            .unwrap_or_default();
        println!(
            "[harness]   rsc {path} status {} type {} content-type {:?} \
             x-vercel-id {:?} x-vercel-cache {:?} x-matched-path {:?}{nextjs}",
            entry["status"].as_u64().unwrap_or(0),
            entry["type"].as_str().unwrap_or("?"),
            entry["contentType"].as_str().unwrap_or(""),
            entry["xVercelId"].as_str().unwrap_or(""),
            entry["xVercelCache"].as_str().unwrap_or(""),
            entry["xMatchedPath"].as_str().unwrap_or(""),
        );
    }
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
///
/// What the retry is up against differs by target, so the bound does too. A
/// remote base is a deployment that may be seconds old: its first RSC fetch can
/// be served cold, or by a region that has not caught up with the new build,
/// and the router answers a payload it does not recognize with a full page load
/// — three attempts inside one second were not enough to outlast it (run
/// 34307954043, 40s after the deploy; a re-run minutes later against the same
/// URL passed with zero retries). So remote gets 5 attempts and a 1s-per-
/// attempt backoff to let the edge settle. A local `next start` has no edge and
/// no propagation, only the Turbopack race the original bound was sized for, so
/// it stays at 3 — a real client-side-navigation regression must not need a
/// six-second wall-clock budget to be called a failure. Neither bound changes
/// what counts as success: an arrival by full page load is never success, and
/// the coverage from the previous page is gone either way.
///
/// `HARNESS_DEBUG_RSC=1` prints the tap's log on success too, which is how one
/// confirms the tap sees healthy navigations and not only broken ones.
pub fn settle(session: &Session, base: &str, script: &str, from: &str, to: &str, what: &str) {
    let local = base.contains("localhost") || base.contains("127.0.0.1");
    let attempts: u32 = if local { 3 } else { 5 };
    let debug = std::env::var_os("HARNESS_DEBUG_RSC").is_some_and(|v| !v.is_empty());

    for attempt in 1..=attempts {
        session
            .eval("window.__harness = true")
            .expect("mark the document");
        arm_rsc_tap(session);

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
            if debug {
                print_rsc_log(session, &format!("{what} reached {to} client-side"));
            }
            return;
        }

        println!("[harness] {what}: {to} arrived by full page load (attempt {attempt}), retrying");
        // Read out of the document the reload just installed — the tap's
        // records outlived the page that wrote them, which is the only reason
        // there is anything to say about why the router bailed out.
        print_rsc_log(session, &format!("{what} reached {to} by full page load"));

        if attempt == attempts {
            break;
        }
        std::thread::sleep(Duration::from_secs(u64::from(attempt)));
        session
            .navigate(&format!("{base}{from}"))
            .expect("return to the interaction's origin");
        wait_hydrated(session, "a");
    }

    panic!(
        "{what} reached {to} only by full page loads across {attempts} attempts — \
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
