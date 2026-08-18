//! The e2e suite and the coverage run, one binary: boots an instrumented Next
//! server, drives a real browser through the app with `agent-browser`, asserts
//! what the app must do, and drops raw Istanbul maps into `.nyc_output` for
//! `scripts/coverage-report.ts` to merge and gate. The route functions below
//! are the readable statement of the app's behavior — coverage is their
//! byproduct, because a run that merely *loads* each route would produce an
//! identical-looking report while proving nothing.

use harness::server::{HOST, Server, repo_root};
use harness::{Session, cdp::Bypass};
use serde_json::Value;
use std::path::Path;
use std::time::{Duration, Instant};

// Not resume-pdf's 4311, and not a port anything else on the machine runs on:
// a stray server from another runner answering this one's requests would
// produce a report of the wrong build.
const PORT: u16 = 3200;
const SESSION: &str = "jlg-coverage";
// Hydration is a race, not an event we can wait on: next/link's handler is
// attached before the router can act, so a click can land in the gap and do
// nothing at all. Retry the click-and-check as a unit.
const SPA_TIMEOUT: Duration = Duration::from_secs(30);

fn main() {
    let started = Instant::now();
    let mode = mode();
    let root = repo_root();
    let base = format!("http://{HOST}:{PORT}");

    let output = root.join(".nyc_output");
    std::fs::create_dir_all(&output).expect("create .nyc_output");

    println!("[harness] {mode} server on {base}");
    // Plain `next`, not the repo's `bun --bun next` convention: forcing bun's
    // runtime with instrumented modules loaded segfaults at process exit on
    // Linux (SIGILL, bun 1.3.14) — the bin's shebang picks node instead.
    // (observed 2026-08-16 · coverage run 31955271334)
    let command = if mode == "prod" { "start" } else { "dev" };
    let server = Server::start(
        "./node_modules/.bin/next",
        &[command, "--port", &PORT.to_string()],
        // Arms the SWC instrumentation (dev) and opens `/api/coverage`.
        &[("COVERAGE", "1")],
        &root,
        PORT,
    );
    server.wait_ready();

    let session = Session::ensure(SESSION).expect("agent-browser session");
    let bypass = Bypass::arm(&session.cdp_url().expect("cdp_url")).expect("arm CSP bypass");
    println!("[harness] CSP enforcement disabled for this browser session");

    let mut written: Vec<(String, usize)> = Vec::new();

    home(&session, &base);
    written.push(harvest(&session, &output, "home"));

    resume(&session, &base);
    written.push(harvest(&session, &output, "resume"));

    // Response-layer checks, fetched from the same-origin page the Escape
    // handler just returned to. These never touch `window.__coverage__`, so
    // their order against the harvests is free.
    robots(&session);
    content_security_policy(&session, "/");
    content_security_policy(&session, "/resume");

    not_found(&session, &base);
    written.push(harvest(&session, &output, "not-found"));

    written.push(server_coverage(&session, &output));

    // Explicit, before the guards run: closing the session tears the daemon
    // down, and the bypass socket has nothing left to hold open once it does.
    drop(bypass);
    session.close().expect("close session");
    drop(server);

    println!(
        "\n[harness] wrote {} file(s) to {}",
        written.len(),
        output.display()
    );
    for (name, files) in &written {
        println!("  {name}: {files} source file(s)");
    }
    println!("[harness] {:.1}s", started.elapsed().as_secs_f64());
}

/// `/` — the statement, the four icon links, and the client-side trips to
/// `/resume` and back. Those trips are the only part of the run that cannot
/// happen without hydration, so they are what proves the client bundle actually
/// executed rather than merely downloaded.
fn home(session: &Session, base: &str) {
    session.navigate(&format!("{base}/")).expect("navigate /");

    let title = session.title().expect("title");
    assert_eq!(
        title, "Joshua L Geschwendt—Software Engineer",
        "unexpected title on /"
    );

    assert_eq!(
        text(session, "h1"),
        "Joshua L Geschwendt",
        "unexpected h1 on /"
    );

    for (label, href) in [
        ("Email", "mailto:joshua@geschwendt.com"),
        ("GitHub", "https://github.com/jgeschwendt"),
        ("LinkedIn", "https://www.linkedin.com/in/jgeschwendt"),
        ("Resume", "/resume"),
    ] {
        let actual = attribute(session, &format!("a[aria-label=\"{label}\"]"), "href");
        assert_eq!(actual, href, "wrong href on the {label} link");
    }

    let statement = text(session, "main p");
    for phrase in [
        "AI augmented software",
        "West Michigan",
        "seasoned software engineer",
        "years of professional experience",
    ] {
        assert!(
            statement.contains(phrase),
            "statement is missing {phrase:?}: {statement:?}"
        );
    }

    // `Statement` splits the sentence on spaces and swaps two words for links —
    // the years figure and "AI".
    let inline = strings(
        session,
        "Array.from(document.querySelectorAll('main p a'), (a) => a.textContent)",
    );
    assert_eq!(inline.len(), 2, "expected two inline statement links");
    assert_eq!(inline[1], "AI", "second inline link is not AI: {inline:?}");

    // The monogram is the only <svg> `main` renders directly.
    assert!(
        count(session, "main svg path") > 0,
        "no monogram <svg> path in main"
    );

    // `generateMetadata` derives the description from the same `statement()`
    // the body renders, per request — a build-time snapshot would drift.
    let description = attribute(session, "meta[name=\"description\"]", "content");
    assert!(
        description.contains("seasoned software engineer"),
        "unexpected description metadata: {description:?}"
    );

    // Three return legs: history back first — `Main` keeps `hasPlayed` at
    // module scope, so the entrance must not replay and the content has to be
    // there either way — then the close control.
    wait_hydrated(session, "a[aria-label=\"Resume\"]");
    click_until(session, "a[aria-label=\"Resume\"]", "/resume");
    back_until(session, "/");
    assert_eq!(
        text(session, "h1"),
        "Joshua L Geschwendt",
        "h1 gone after history back"
    );
    click_until(session, "a[aria-label=\"Resume\"]", "/resume");
    click_until(session, "a[aria-label=\"Close résumé\"]", "/");
}

/// `/resume` reached by a hard navigation, which is a different render path
/// from the client-side one `home` already exercised.
fn resume(session: &Session, base: &str) {
    session
        .navigate(&format!("{base}/resume"))
        .expect("navigate /resume");

    assert_eq!(
        session.title().expect("title"),
        "Joshua L Geschwendt—Résumé",
        "unexpected title on /resume"
    );
    assert_eq!(
        text(session, "h1"),
        "Joshua L Geschwendt",
        "unexpected h1 on /resume"
    );

    let headings = strings(
        session,
        "Array.from(document.querySelectorAll('h2'), (h) => h.textContent)",
    );
    for section in ["Contact", "Education", "Experience"] {
        assert!(
            headings.iter().any(|h| h == section),
            "no <h2> {section:?} on /resume: {headings:?}"
        );
    }

    // The oldest entry is the one the `flex-col-reverse` ordering puts last, so
    // asserting it covers the whole array having rendered.
    let entries = strings(
        session,
        "Array.from(document.querySelectorAll('h3'), (h) => h.textContent)",
    );
    assert!(
        entries.iter().any(|h| h.contains("Springthrough")),
        "no Springthrough <h3> on /resume: {entries:?}"
    );

    // One <h3> per role in the experience <ol>, each with its own "Stack:"
    // line — counting all three shapes asserts the array rendered whole.
    let roles = count(session, "ol > li");
    assert!(roles > 1, "expected more than one role, found {roles}");
    assert_eq!(count(session, "h3"), roles, "one <h3> per role");
    let stacks = session
        .eval(
            "Array.from(document.querySelectorAll('main *')).filter((el) => \
             el.children.length === 0 && el.textContent.trim() === 'Stack:').length",
        )
        .expect("count Stack: labels")
        .as_u64()
        .expect("count is a number");
    assert_eq!(stacks, roles, "one Stack: line per role");
    assert_eq!(
        count(session, "footer a[href^=\"mailto:\"]"),
        1,
        "no mailto link in the résumé footer"
    );

    // Reachable by JS only: `Close` registers a document-level keydown listener
    // in an effect and calls `router.push`, so a bundle that never hydrated
    // swallows this key press.
    press_escape_until(session, "/");
}

/// `/robots.txt` is generated by `src/app/robots.ts`, a route with no client
/// bundle at all — read over fetch from an app page, which also exposes the
/// status and content type a navigation would swallow.
fn robots(session: &Session) {
    let probe = fetch_probe(session, "/robots.txt");
    assert_eq!(probe.status, 200, "robots.txt status");
    assert!(
        probe.content_type.contains("text/plain"),
        "robots.txt content-type: {:?}",
        probe.content_type
    );
    for line in ["Allow: /$", "Disallow: /", "User-Agent: *"] {
        assert!(
            probe.body.contains(line),
            "robots.txt is missing {line:?}: {:?}",
            probe.body
        );
    }
}

/// The per-request CSP minted in `src/server/proxy/content-security-policy.ts`.
/// Only the invariants are asserted — dev's script-src legitimately adds
/// `'unsafe-eval'` — and the nonce on the wire has to be the one Next stamped
/// onto the markup it rendered in the same response. That mismatch is exactly
/// what browser enforcement would have caught, and this run disables
/// enforcement (see `cdp.rs`), so the assertion is the replacement.
fn content_security_policy(session: &Session, path: &str) {
    let probe = fetch_probe(session, path);
    assert_eq!(probe.status, 200, "{path} status");

    for directive in [
        "base-uri 'self'",
        "default-src 'none'",
        "form-action 'self'",
        "frame-src 'none'",
        "upgrade-insecure-requests",
    ] {
        assert!(
            probe.csp.contains(directive),
            "{path} CSP is missing {directive:?}: {:?}",
            probe.csp
        );
    }

    let nonce = nonce_of(&probe.csp, path);
    assert!(
        probe.body.contains(&format!("nonce=\"{nonce}\"")),
        "{path}: the CSP nonce is not on the rendered <script> tags"
    );

    // Minted per request, so two loads of the same route must not share one.
    let again = fetch_probe(session, path);
    assert_ne!(
        nonce_of(&again.csp, path),
        nonce,
        "{path}: nonce repeated across requests"
    );
}

/// The 404 path, which renders Next's own not-found page rather than anything
/// in `src/app`. The status comes from a fetch, the rendered body from a real
/// navigation — the fetch alone would not exercise the client render.
fn not_found(session: &Session, base: &str) {
    let probe = fetch_probe(session, "/no-such-page");
    assert_eq!(probe.status, 404, "unknown path status");

    session
        .navigate(&format!("{base}/no-such-page"))
        .expect("navigate /no-such-page");

    let body = text(session, "body");
    assert!(
        body.contains("could not be found"),
        "unexpected 404 body: {body:?}"
    );
}

/// The server's cumulative map, read while the browser is still on a
/// same-origin document: `evaluate` awaits promises, so the fetch resolves
/// before the reply comes back and the run needs no HTTP client of its own.
fn server_coverage(session: &Session, output: &Path) -> (String, usize) {
    let probe = fetch_probe(session, "/api/coverage");
    assert_eq!(probe.status, 200, "/api/coverage status");
    assert!(
        probe.cache_control.contains("no-store"),
        "/api/coverage cache-control: {:?}",
        probe.cache_control
    );
    write_map(output, "server-harness", &probe.body, false)
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
fn wait_hydrated(session: &Session, selector: &str) {
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

/// Clicks `selector` until the location settles on `path`. `HTMLElement.click`
/// dispatches an untrusted event, which React's synthetic handlers accept and
/// next/link's `preventDefault` still fires on — so this is a genuine
/// client-side navigation, not a disguised `location.assign`.
fn click_until(session: &Session, selector: &str, path: &str) {
    let script = format!(
        "(() => {{ const el = document.querySelector('{selector}'); \
         if (el) el.click(); return location.pathname; }})()"
    );
    settle(session, &script, path, selector);
}

/// One history pop, then the same sentinel check as a click: a back that
/// reloads the document would discard the heap — and the counters — exactly
/// like an unhydrated anchor would.
fn back_until(session: &Session, path: &str) {
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

fn press_escape_until(session: &Session, path: &str) {
    let script = "(() => { document.dispatchEvent(new KeyboardEvent('keydown', \
                  { bubbles: true, key: 'Escape' })); return location.pathname; })()";
    settle(session, script, path, "Escape");
}

/// Repeats `script` until it reports `path`, then proves the move was
/// client-side. The sentinel is a plain property of the JS heap, so it survives
/// a router push and dies with a full page load — the same thing that would
/// silently discard every counter accumulated since the last harvest. Without
/// this check an unhydrated anchor following its own `href` would look exactly
/// like a successful hydration test.
fn settle(session: &Session, script: &str, path: &str, what: &str) {
    session
        .eval("window.__harness = true")
        .expect("mark the document");

    let deadline = Instant::now() + SPA_TIMEOUT;
    loop {
        let at = session.eval(script).expect("client-side navigation");
        if at.as_str() == Some(path) {
            break;
        }
        assert!(
            Instant::now() < deadline,
            "{what} never reached {path} (still at {at})"
        );
        std::thread::sleep(Duration::from_millis(250));
    }

    assert_eq!(
        session.eval("window.__harness === true").expect("sentinel"),
        Value::Bool(true),
        "{what} reached {path} by a full page load, not the router — \
         the coverage from the previous page is gone"
    );
}

/// Reads `window.__coverage__` and files it under `.nyc_output`. Every hard
/// navigation discards the map, so this has to run before the next one — client
/// coverage is not cumulative across page loads the way the server's is.
fn harvest(session: &Session, output: &Path, label: &str) -> (String, usize) {
    let raw = session
        .eval("JSON.stringify(window.__coverage__ ?? {})")
        .expect("read window.__coverage__");
    let raw = raw.as_str().expect("coverage map is a JSON string");
    write_map(output, &format!("client-harness-{label}"), raw, true)
}

/// `tolerate_empty` is for the client maps: a route that ships no Client
/// Components legitimately has none, and failing there would make the harness
/// brittle about which routes happen to be interactive. An empty *server* map
/// means the instrumentation is dead, which must be loud.
fn write_map(output: &Path, name: &str, raw: &str, tolerate_empty: bool) -> (String, usize) {
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

struct FetchProbe {
    body: String,
    cache_control: String,
    content_type: String,
    csp: String,
    status: u16,
}

/// One same-origin fetch, reported whole. `evaluate` awaits the promise and
/// returns by value, so the status, the headers the suite asserts, and the body
/// come back in a single round trip — and a same-origin `Response` hides
/// nothing but `Set-Cookie`.
fn fetch_probe(session: &Session, path: &str) -> FetchProbe {
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

/// The `'nonce-…'` value out of a policy's script-src. Base64ish by
/// construction, so everything up to the closing quote is the nonce.
fn nonce_of(csp: &str, path: &str) -> String {
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

fn attribute(session: &Session, selector: &str, name: &str) -> String {
    let script = format!("document.querySelector('{selector}')?.getAttribute('{name}') ?? null");
    session
        .eval(&script)
        .expect("read attribute")
        .as_str()
        .unwrap_or_else(|| panic!("no {selector} with a {name} attribute"))
        .to_string()
}

fn count(session: &Session, selector: &str) -> u64 {
    session
        .eval(&format!("document.querySelectorAll('{selector}').length"))
        .expect("count elements")
        .as_u64()
        .expect("count is a number")
}

fn strings(session: &Session, script: &str) -> Vec<String> {
    session
        .eval(script)
        .expect("read strings")
        .as_array()
        .expect("script returned an array")
        .iter()
        .map(|value| value.as_str().unwrap_or_default().trim().to_string())
        .collect()
}

/// `textContent`, not `innerText`: the home page animates in from `opacity: 0`,
/// and `innerText` is layout-aware enough to return nothing for content the
/// entrance has not revealed yet.
fn text(session: &Session, selector: &str) -> String {
    let script = format!("document.querySelector('{selector}')?.textContent ?? null");
    session
        .eval(&script)
        .expect("read text")
        .as_str()
        .unwrap_or_else(|| panic!("no element matching {selector}"))
        .trim()
        .to_string()
}

fn mode() -> String {
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
