//! A Rust-driven Istanbul coverage run: boots an instrumented Next server,
//! drives a real browser through the app with `agent-browser`, and drops raw
//! coverage maps into `.nyc_output` for `scripts/coverage-report.ts` to merge
//! and gate. It is the Playwright suite's route surface reached a different
//! way, not a replacement for it — the specs remain the readable statement of
//! what the app must do.
//!
//! Coverage stays a byproduct of asserted behavior. Every navigation here is
//! followed by checks that fail loudly, because a run that merely *loads* each
//! route would produce an identical-looking report while proving nothing.

use harness::{Session, cdp::Bypass};
use serde_json::Value;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

const HOST: &str = "localhost";
// Not 3100: that port belongs to the Playwright config, and a stray server from
// either runner answering the other's requests would produce a report of the
// wrong build.
const PORT: u16 = 3200;
const READY_TIMEOUT: Duration = Duration::from_secs(300);
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
    let server = Server::start(&mode, &root);
    server.wait_ready();

    let session = Session::ensure(SESSION).expect("agent-browser session");
    let bypass = Bypass::arm(&session.cdp_url().expect("cdp_url")).expect("arm CSP bypass");
    println!("[harness] CSP enforcement disabled for this browser session");

    let mut written: Vec<(String, usize)> = Vec::new();

    home(&session, &base);
    written.push(harvest(&session, &output, "home"));

    resume(&session, &base);
    written.push(harvest(&session, &output, "resume"));

    robots(&session, &base);

    not_found(&session, &base);
    written.push(harvest(&session, &output, "not-found"));

    // Read the server's map from inside the page, while the browser is still on
    // a same-origin document: `evaluate` awaits promises, so the fetch resolves
    // before the reply comes back, and the run needs no HTTP client of its own.
    let server_map = session
        .eval("fetch('/api/coverage', { cache: 'no-store' }).then((r) => r.text())")
        .expect("GET /api/coverage");
    let server_map = server_map.as_str().expect("coverage response is text");
    written.push(write_map(&output, "server-harness", server_map, false));

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

/// `/` — the statement, the four icon links, and the client-side round trip to
/// `/resume` and back. That round trip is the only part of the run that cannot
/// happen without hydration, so it is what proves the client bundle actually
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

    // `generateMetadata` derives the description from the same `statement()`
    // the body renders, per request — a build-time snapshot would drift.
    let description = attribute(session, "meta[name=\"description\"]", "content");
    assert!(
        description.contains("seasoned software engineer"),
        "unexpected description metadata: {description:?}"
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

    // One <h3> per role, so this also asserts the whole experience array
    // rendered rather than just its first entry.
    let roles = count(session, "ol > li");
    assert!(roles > 1, "expected more than one role, found {roles}");
    assert_eq!(count(session, "h3"), roles, "one <h3> per role");
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
/// bundle at all — nothing to harvest here, only the server's map moves.
fn robots(session: &Session, base: &str) {
    session
        .navigate(&format!("{base}/robots.txt"))
        .expect("navigate /robots.txt");

    let body = text(session, "body");
    for line in ["Allow: /$", "Disallow: /", "User-Agent: *"] {
        assert!(
            body.contains(line),
            "robots.txt is missing {line:?}: {body:?}"
        );
    }
}

/// The 404 path, which renders Next's own not-found page rather than anything
/// in `src/app`.
fn not_found(session: &Session, base: &str) {
    session
        .navigate(&format!("{base}/no-such-page"))
        .expect("navigate /no-such-page");

    let body = text(session, "body");
    assert!(
        body.contains("could not be found"),
        "unexpected 404 body: {body:?}"
    );
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

/// The crate lives at `crates/harness`, so the repo root is two levels up. This
/// is resolved at compile time rather than from the working directory because
/// `cargo run --manifest-path` leaves the caller's cwd untouched.
fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("crates/harness is two levels below the repo root")
        .to_path_buf()
}

/// The instrumented Next server, owned so that a failed assertion takes it down
/// with it: every check in this binary panics, and a panic unwinds through
/// `main`'s locals.
struct Server {
    child: Child,
}

impl Server {
    /// Plain `next`, not the repo's `bun --bun next` convention — the coverage
    /// flow lets the bin's shebang pick the runtime, because forcing bun's
    /// runtime with instrumented modules loaded segfaults at process exit
    /// (see the note in `playwright.config.ts`).
    fn start(mode: &str, root: &Path) -> Self {
        let port = PORT.to_string();
        let command = if mode == "prod" { "start" } else { "dev" };
        let child = Command::new("./node_modules/.bin/next")
            .args([command, "--port", &port])
            .current_dir(root)
            // Arms the SWC instrumentation (dev) and opens `/api/coverage`.
            .env("COVERAGE", "1")
            // Its own process group: `next` starts helper processes, and
            // killing only the process we spawned would leave the port held.
            .process_group(0)
            .stdout(Stdio::null())
            .stderr(Stdio::inherit())
            .spawn()
            .expect("spawn next — run this from a repo with node_modules installed");

        Server { child }
    }

    /// Turbopack compiles routes lazily, so a cold dev server can take minutes
    /// before the first response. Poll rather than sleep on a guess.
    fn wait_ready(&self) {
        let deadline = Instant::now() + READY_TIMEOUT;
        while Instant::now() < deadline {
            if get_status("/") == Some(200) {
                return;
            }
            std::thread::sleep(Duration::from_millis(500));
        }
        panic!("next never answered on {HOST}:{PORT} within {READY_TIMEOUT:?}");
    }
}

impl Drop for Server {
    fn drop(&mut self) {
        // Signal the group, not the process: `process_group(0)` made the
        // child's pid its own group id, so a negative pid reaches its helpers
        // too. `kill(1)` avoids a libc dependency for one signal.
        let group = format!("-{}", self.child.id());
        let _ = Command::new("kill")
            .args(["-TERM", &group])
            .stderr(Stdio::null())
            .status();
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// A hand-rolled readiness probe. One request, one status line, no HTTP client
/// in the dependency set — everything else this binary needs from the network
/// it gets through the browser.
fn get_status(path: &str) -> Option<u16> {
    let mut stream = TcpStream::connect((HOST, PORT)).ok()?;
    stream
        .set_read_timeout(Some(Duration::from_secs(30)))
        .ok()?;
    stream
        .write_all(
            format!("GET {path} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\nConnection: close\r\n\r\n")
                .as_bytes(),
        )
        .ok()?;

    let mut response = Vec::new();
    stream.read_to_end(&mut response).ok()?;
    let head = String::from_utf8_lossy(&response);
    head.split_whitespace().nth(1)?.parse().ok()
}
