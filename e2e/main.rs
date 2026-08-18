//! The e2e suite and the coverage run, one binary: boots an instrumented Next
//! server, drives a real browser through the app with `agent-browser`, asserts
//! what the app must do, and drops raw Istanbul maps into `.nyc_output` for
//! `scripts/coverage-report.ts` to merge and gate. The route functions below
//! are the readable statement of the app's behavior — coverage is their
//! byproduct, because a run that merely *loads* each route would produce an
//! identical-looking report while proving nothing. The driving machinery lives
//! in `harness::kit`; only this app's assertions live here.

use harness::kit::{
    attribute, back_until, click_until, count, dump, fetch_probe, harvest, mode, nonce_of,
    press_escape_until, server_coverage, strings, text, wait_hydrated,
};
use harness::server::{HOST, Server, repo_root};
use harness::{Session, cdp::Bypass};
use std::time::Instant;

// Not resume-pdf's 4311, and not a port anything else on the machine runs on:
// a stray server from another runner answering this one's requests would
// produce a report of the wrong build.
const PORT: u16 = 3200;
const SESSION: &str = "jlg-coverage";

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

    // Response-layer checks, fetched from the home page. They never touch
    // `window.__coverage__`, and they run BEFORE the click trips on purpose:
    // fetching `/resume` forces its first dev compile, closing the window where
    // Turbopack finishing that compile mid-navigation reloads the page out from
    // under the router (the settle() retry covers whatever this cannot).
    robots(&session);
    content_security_policy(&session, "/");
    content_security_policy(&session, "/resume");

    home_trips(&session, &base);
    written.push(harvest(&session, &output, "home"));

    resume(&session, &base);
    written.push(harvest(&session, &output, "resume"));

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

/// `/` — the statement, the four icon links, the metadata. The hydration-proof
/// interactions live in `home_trips`, which runs after the response-layer
/// probes have warmed `/resume`.
fn home(session: &Session, base: &str) {
    session.navigate(&format!("{base}/")).expect("navigate /");

    let title = session.title().expect("title");
    if title != "Joshua L Geschwendt—Software Engineer" {
        dump(session, "title mismatch on /");
        panic!("unexpected title on /: {title:?}");
    }

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
}

/// The client-side trips `/` ⇄ `/resume` — the only part of the run that cannot
/// happen without hydration, which is what proves the client bundle actually
/// executed rather than merely downloaded. Three return legs: history back
/// first — `Main` keeps `hasPlayed` at module scope, so the entrance must not
/// replay and the content has to be there either way — then the close control.
fn home_trips(session: &Session, base: &str) {
    wait_hydrated(session, "a[aria-label=\"Resume\"]");
    click_until(session, base, "a[aria-label=\"Resume\"]", "/", "/resume");
    back_until(session, "/");
    assert_eq!(
        text(session, "h1"),
        "Joshua L Geschwendt",
        "h1 gone after history back"
    );
    click_until(session, base, "a[aria-label=\"Resume\"]", "/", "/resume");
    click_until(
        session,
        base,
        "a[aria-label=\"Close résumé\"]",
        "/resume",
        "/",
    );
}

/// `/resume` reached by a hard navigation, which is a different render path
/// from the client-side one `home_trips` already exercised.
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
    press_escape_until(session, base, "/resume", "/");
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
/// enforcement (see `harness::cdp`), so the assertion is the replacement.
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
