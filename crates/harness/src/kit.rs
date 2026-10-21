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

// Zeroes every counter in `live` — one source for the stash and the harvest,
// which must agree on it or a hit is reported twice.
macro_rules! zero_live {
    () => {
        "for (const file of Object.values(live)) { \
         for (const id in file.s) file.s[id] = 0; for (const id in file.f) file.f[id] = 0; \
         for (const id in file.b) file.b[id] = file.b[id].map(() => 0); }"
    };
}

/// Registered on every page target (`cdp::Bypass::arm`) so a document's client
/// counters outlive it. A full page load — `goto`, or a `<Link>` click that
/// degrades into one under the hydration race — discards the JS heap and with
/// it `window.__coverage__`; on `pagehide` this files the map in
/// `sessionStorage`, which survives a same-origin load, and zeroes the live
/// counters so a back-forward-cache restore does not count them twice.
/// (observed 2026-10-08 · a race-degraded Close click lost `Main.tsx`'s
/// return-visit branch; the run before it, race-free, had covered it)
pub(crate) const COVERAGE_STASH: &str = concat!(
    "addEventListener('pagehide', () => { \
     const live = window.__coverage__; if (!live) return; \
     const stash = JSON.parse(sessionStorage.getItem('__harness_coverage') ?? '[]'); \
     stash.push(live); sessionStorage.setItem('__harness_coverage', JSON.stringify(stash)); ",
    zero_live!(),
    " });"
);

const HARVEST: &str = concat!(
    "(() => { \
     const maps = JSON.parse(sessionStorage.getItem('__harness_coverage') ?? '[]'); \
     sessionStorage.removeItem('__harness_coverage'); \
     const live = window.__coverage__; \
     if (live) maps.push(JSON.parse(JSON.stringify(live))); \
     const merged = {}; \
     for (const map of maps) for (const [path, file] of Object.entries(map)) { \
       const into = merged[path]; \
       if (!into) { merged[path] = file; continue; } \
       for (const id in file.s) into.s[id] += file.s[id]; \
       for (const id in file.f) into.f[id] += file.f[id]; \
       for (const id in file.b) into.b[id] = into.b[id].map((n, arm) => n + file.b[id][arm]); } \
     if (live) ",
    zero_live!(),
    " return JSON.stringify(merged); })()"
);

// Every `poll`'s deadline.
const POLL_TIMEOUT: Duration = Duration::from_secs(30);

// Reads the tap's buffer out of `sessionStorage`, empties it, and reports how
// the CURRENT document was entered — after a full-load fallback that is the new
// document, whose navigation type ("navigate" for a link the router let through
// to the browser, "reload" for a genuine reload) separates the two stories.
const RSC_DRAIN: &str = "(() => { const KEY = '__harness_rsc'; let log = []; \
     try { log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {} \
     try { sessionStorage.removeItem(KEY); } catch (e) {} \
     const nav = performance.getEntriesByType('navigation')[0]; \
     return { entries: log, navigation: nav ? nav.type : null, \
       tapped: Boolean(window.__harness_rsc_tapped) }; })()";

// Wraps `window.fetch` for the rest of the document's life so every App Router
// RSC fetch, prefetches included, leaves evidence that OUTLIVES the page. A
// `<Link>` click degrades to a full page load when the RSC fetch for the target
// does not come back as an RSC payload — a non-`text/x-component` content type, an error
// page, a cross-origin redirect, a build/deployment-id mismatch — and the
// reload that follows wipes the page before anything can be asked about it.
// The record goes to `sessionStorage`, not a `window` property — the one place
// a record written before a full page load can still be read after it, so
// `print_rsc_log` reads it out of the NEW document; and it is
// per-origin-per-tab, so a run never reads another's entries. Same-origin
// responses hide no headers, so the Vercel routing trail (`x-vercel-id`,
// `x-vercel-cache`, `x-matched-path`, any `x-nextjs-*`) comes back alongside
// the status. Idempotent per document via `window.__harness_rsc_tapped`;
// diagnostics only, and a rejected fetch is re-thrown untouched.
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
     const original = window.fetch; \
     window.fetch = function (input) { \
       const url = String((input && input.url) || input); \
       const pending = original.apply(this, arguments); \
       if (!url.includes('_rsc')) return pending; \
       let path = url; \
       try { const parsed = new URL(url, location.href); \
         path = parsed.pathname + parsed.search; } catch (e) {} \
       const at = Date.now(); \
       return pending.then((response) => { \
         const nextjs = {}; \
         try { response.headers.forEach((value, name) => { \
           if (name.indexOf('x-nextjs-') === 0) nextjs[name] = value; }); } catch (e) {} \
         const header = (name) => { \
           try { return response.headers.get(name) || ''; } catch (e) { return ''; } }; \
         record({ at, contentType: header('content-type'), nextjs, path, \
           status: response.status, type: response.type, url, \
           xMatchedPath: header('x-matched-path'), xVercelCache: header('x-vercel-cache'), \
           xVercelId: header('x-vercel-id') }); \
         return response; \
       }, (error) => { \
         record({ at, error: String(error), path, url }); \
         throw error; \
       }); \
     }; \
     return true; })()";

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FetchProbe {
    pub body: String,
    pub cache_control: String,
    pub content_type: String,
    pub csp: String,
    pub status: u16,
}

/// Reads an element's attribute, panicking when the element is missing.
pub fn attribute(session: &Session, selector: &str, name: &str) -> String {
    session
        .eval(&format!(
            "document.querySelector('{selector}')?.getAttribute('{name}') ?? null"
        ))
        .expect("read attribute")
        .as_str()
        .unwrap_or_else(|| panic!("no {selector} with a {name} attribute"))
        .to_string()
}

/// One history pop, then the same sentinel check as a click: a back that
/// reloads the document would discard the heap — and the counters — exactly
/// like an unhydrated anchor would.
pub fn back_until(session: &Session, path: &str) {
    mark(session);
    session.back().expect("history back");
    let state = poll(
        session,
        "[location.pathname, window.__harness === true]",
        "read location",
        250,
        |at| at[0] == path,
    )
    .unwrap_or_else(|at| panic!("history back never reached {path} (still at {})", at[0]));
    if state[1] != true {
        print_rsc_log(session, &format!("history back to {path}, full page load"));
        panic!("history back reached {path} by a full page load, not the router");
    }
}

/// The origin a run drives instead of one it started itself: `--base <url>` or
/// `--base=<url>` on the command line, else `HARNESS_BASE`. `None` is the
/// default and means the suite owns its own `Server`. One trailing `/` comes
/// off so `{base}/path` composes the same way either answer arrives.
pub fn base_url() -> Option<String> {
    flag("base", "HARNESS_BASE").map(|url| url.strip_suffix('/').unwrap_or(&url).to_string())
}

/// Clicks `selector` until the location settles on `to`. `HTMLElement.click`
/// dispatches an untrusted event, which React's synthetic handlers accept and
/// next/link's `preventDefault` still fires on — so this is a genuine
/// client-side navigation, not a disguised `location.assign`.
pub fn click_until(session: &Session, base: &str, selector: &str, from: &str, to: &str) {
    let action = format!("document.querySelector('{selector}')?.click(); ");
    settle(session, base, &action, from, to, selector);
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
/// nothing but `Set-Cookie`. `headers` are for routes whose behavior a request
/// header selects, embedded as JSON string literals.
pub fn fetch_probe(session: &Session, path: &str, headers: &[(&str, &str)]) -> FetchProbe {
    let headers: Value = headers.iter().copied().collect();
    let script = format!(
        "fetch('{path}', {{ cache: 'no-store', headers: {headers} }}).then(async (r) => ({{ \
           body: await r.text(), \
           cacheControl: r.headers.get('cache-control') ?? '', \
           contentType: r.headers.get('content-type') ?? '', \
           csp: r.headers.get('content-security-policy') ?? '', \
           status: r.status }}))"
    );
    serde_json::from_value(session.eval(&script).expect("fetch probe"))
        .unwrap_or_else(|e| panic!("{path} probe: {e}"))
}

/// The last `--{name} <value>` or `--{name}=<value>` on the command line, else
/// the `env` variable.
fn flag(name: &str, env: &str) -> Option<String> {
    let (bare, prefix) = (format!("--{name}"), format!("--{name}="));
    let mut args = std::env::args().skip(1);
    let mut value = std::env::var(env).ok();
    while let Some(arg) = args.next() {
        if arg == bare {
            value = args.next().or(value);
        } else if let Some(inline) = arg.strip_prefix(&prefix) {
            value = Some(inline.to_string());
        }
    }
    value
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
        poll(
            session,
            "({ href: location.href, ready: document.readyState })",
            "probe navigation",
            100,
            |state| state["href"] == url && state["ready"] == "complete",
        )
        .unwrap_or_else(|state| panic!("never settled on {url}: {state}"));

        // The tap is armed here, not only at the interactions, so the app's own
        // prefetches are caught: a `<Link>` in view fetches its RSC payload
        // long before any click, and a prefetch that came back wrong is the
        // likeliest reason a later click degrades to a full page load. Only
        // when no shell answered — `||` short-circuits past it.
        if session
            .eval(&format!(
                "document.documentElement.id === '__next_error__' || ({RSC_TAP}, false)"
            ))
            .expect("probe error shell")
            != true
        {
            return;
        }

        let context = format!("error shell on {url}, attempt {attempt}");
        dump(session, &context);
        print_rsc_log(session, &context);
        // Both sides of the story, the whole refetched body kept in
        // .nyc_output, which CI uploads on failure.
        let probe = fetch_probe(session, url, &[]);
        let refetch_shell = probe.body.contains("__next_error__");
        let head = probe.body.chars().take(200).collect::<String>();
        println!(
            "[harness] refetch {url}: status {}, csp {} chars, {} bytes, shell {refetch_shell}, head: {head:?}",
            probe.status,
            probe.csp.len(),
            probe.body.len()
        );
        let _ = std::fs::write(
            crate::server::repo_root()
                .join(format!(".nyc_output/debug-shell-attempt{attempt}.html")),
            &probe.body,
        );
        std::thread::sleep(Duration::from_millis(500));
    }

    panic!("{url} served the __next_error__ shell across {ATTEMPTS} attempts");
}

/// Every client counter since the last harvest — the live map plus whatever
/// `COVERAGE_STASH` filed from documents a load replaced — summed into one map
/// and, when it maps any file, written under `output`. The stash is cleared and
/// the live counters zeroed, so no hit is ever reported twice.
pub fn harvest(session: &Session, output: &Path, label: &str) -> (String, usize) {
    let raw = session.eval(HARVEST).expect("read window.__coverage__");
    let raw = raw.as_str().expect("coverage map is a JSON string");
    write_map(output, &format!("client-harness-{label}"), raw)
}

/// Sets the `settle`/`back_until` sentinel and arms the RSC tap in one round
/// trip.
fn mark(session: &Session) {
    session
        .eval(&format!("(window.__harness = true, {RSC_TAP})"))
        .expect("mark the document");
}

/// `--mode`, else COVERAGE_MODE, else `dev`; anything but `dev`/`prod` panics.
pub fn mode() -> &'static str {
    match flag("mode", "COVERAGE_MODE").as_deref() {
        None | Some("dev") => "dev",
        Some("prod") => "prod",
        Some(other) => panic!("mode must be dev or prod, got {other:?}"),
    }
}

/// The `'nonce-…'` value out of a policy's script-src. Base64ish by
/// construction, so everything up to the closing quote is the nonce.
pub fn nonce_of(csp: &str, path: &str) -> String {
    csp.split_once("'nonce-")
        .and_then(|(_, rest)| rest.split_once('\''))
        .map(|(nonce, _)| nonce.to_string())
        .unwrap_or_else(|| panic!("{path}: no terminated nonce in CSP: {csp:?}"))
}

/// Evaluates `script` every `interval_ms` until `done` accepts its value, or
/// `POLL_TIMEOUT` runs out — then hands the last value back for the caller's
/// panic. The accepted value comes back as `Ok`.
fn poll(
    session: &Session,
    script: &str,
    what: &str,
    interval_ms: u64,
    done: impl Fn(&Value) -> bool,
) -> Result<Value, Value> {
    let deadline = Instant::now() + POLL_TIMEOUT;
    loop {
        let value = session.eval(script).expect(what);
        if done(&value) {
            return Ok(value);
        }
        if Instant::now() >= deadline {
            return Err(value);
        }
        std::thread::sleep(Duration::from_millis(interval_ms));
    }
}

/// Dispatches `keys` as document-level keydowns until the location settles on
/// `to`, in order within one evaluation — so when the last key's navigation
/// lands, every key before it reached the same listener.
pub fn press_keys_until(session: &Session, base: &str, keys: &[&str], from: &str, to: &str) {
    let presses: String = keys
        .iter()
        .map(|key| {
            format!(
                "document.dispatchEvent(new KeyboardEvent('keydown', {{ bubbles: true, key: {} }})); ",
                Value::from(*key)
            )
        })
        .collect();
    settle(session, base, &presses, from, to, &keys.join("+"));
}

/// Drains `RSC_TAP`'s buffer to stdout, one `rsc` line per RSC fetch,
/// prefetches included, plus how the current document was entered. Diagnostics
/// only — it asserts nothing, never panics on a missing tap, and empties the
/// buffer so the next report carries only what happened since.
fn print_rsc_log(session: &Session, context: &str) {
    let report = match session.eval(RSC_DRAIN) {
        Ok(report) => report,
        Err(e) => return println!("[harness] rsc log ({context}): unavailable: {e}"),
    };
    let entries = report["entries"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default();
    println!(
        "[harness] rsc log ({context}): {} rsc fetch(es), navigation type {}, tapped {}",
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
        let nextjs = match &entry["nextjs"] {
            nextjs @ Value::Object(map) if !map.is_empty() => format!(" x-nextjs {nextjs}"),
            _ => String::new(),
        };
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
    let probe = fetch_probe(session, "/api/coverage", &[]);
    assert_eq!(probe.status, 200, "/api/coverage status");
    assert!(
        probe.cache_control.contains("no-store"),
        "/api/coverage cache-control: {:?}",
        probe.cache_control
    );
    let (name, files) = write_map(output, "server-harness", &probe.body);
    // An empty server map means the instrumentation is dead, which must be loud.
    assert!(
        files > 0,
        "{name}: coverage map is empty — is COVERAGE=1 reaching the server?"
    );
    (name, files)
}

/// Repeats `action` until the location reports `to`, then proves the move was
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
/// (run 34307954043, 40s after the deploy; a re-run minutes later passed with
/// zero retries). A local server has no edge, only `next dev`'s Turbopack race,
/// and a real regression must not wait out remote's backoff to be called a
/// failure. Neither bound changes what counts as success: an arrival by full
/// page load never is.
///
/// `HARNESS_DEBUG_RSC=1` prints the tap's log on success too, which is how one
/// confirms the tap sees healthy navigations and not only broken ones.
fn settle(session: &Session, base: &str, action: &str, from: &str, to: &str, what: &str) {
    let local = base.contains(crate::server::HOST);
    let attempts: u32 = if local { 3 } else { 5 };
    let script =
        format!("(() => {{ {action}return [location.pathname, window.__harness === true]; }})()");

    for attempt in 1..=attempts {
        mark(session);
        let state = poll(session, &script, "client-side navigation", 250, |at| {
            at[0] == to
        })
        .unwrap_or_else(|at| panic!("{what} never reached {to} (still at {})", at[0]));

        if state[1] == true {
            if std::env::var_os("HARNESS_DEBUG_RSC").is_some_and(|v| !v.is_empty()) {
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
        goto(session, &format!("{base}{from}"));
        wait_hydrated(session, "a");
    }

    panic!(
        "{what} reached {to} only by full page loads across {attempts} attempts — \
         the coverage from the previous page is gone"
    );
}

/// Every `selector` match's `textContent`, trimmed. `textContent`, not
/// `innerText`: a page animating in from `opacity: 0` makes `innerText` — which
/// is layout-aware — return nothing for content the entrance has not revealed
/// yet.
pub fn strings(session: &Session, selector: &str) -> Vec<String> {
    session
        .eval(&format!(
            "Array.from(document.querySelectorAll('{selector}'), (e) => e.textContent)"
        ))
        .expect("read strings")
        .as_array()
        .expect("script returned an array")
        .iter()
        .map(|value| value.as_str().unwrap_or_default().trim().to_string())
        .collect()
}

/// The first of `strings`, panicking when nothing matches.
pub fn text(session: &Session, selector: &str) -> String {
    strings(session, selector)
        .into_iter()
        .next()
        .unwrap_or_else(|| panic!("no element matching {selector}"))
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
    poll(session, &script, "probe hydration", 250, |v| v == true)
        .unwrap_or_else(|_| panic!("{selector} never hydrated — no React fiber attached"));
}

/// Writes `raw` only when it maps at least one file. Empty is legitimate for a
/// client map — a route that ships no Client Components has none — so whether
/// empty is a failure is the caller's call (`server_coverage` makes it one).
fn write_map(output: &Path, name: &str, raw: &str) -> (String, usize) {
    let map: Value = serde_json::from_str(raw).unwrap_or_else(|e| panic!("{name}: {e}"));
    let files = map.as_object().map_or(0, serde_json::Map::len);
    if files > 0 {
        let path = output.join(format!("coverage-{name}.json"));
        std::fs::write(&path, raw).unwrap_or_else(|e| panic!("write {}: {e}", path.display()));
    }
    (name.to_string(), files)
}
