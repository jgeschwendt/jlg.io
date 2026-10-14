//! Prints `/resume` to `public/resume.pdf` off a production `next start`, with
//! `Session::pdf`'s defaults.

use harness::Session;
use harness::server::{HOST, Server, repo_root};

// Not coverage's 3200: these binaries may run back to back, and a stray server
// answering the wrong runner would print (or measure) the wrong build.
const PORT: u16 = 4311;
const SESSION: &str = "jlg-resume-pdf";

fn main() {
    let root = repo_root();

    let server = Server::start(
        "bun",
        &["--bun", "next", "start", "--port", &PORT.to_string()],
        &[],
        &root,
        PORT,
    );

    let session = Session::ensure(SESSION).expect("agent-browser session");
    harness::kit::goto(&session, &format!("http://{HOST}:{PORT}/resume"));

    // The PDF embeds whatever glyphs are loaded at print time; an unresolved
    // webfont silently falls back in the output.
    let fonts = session
        .eval("document.fonts.ready.then(() => true)")
        .expect("wait for fonts");
    assert_eq!(fonts, serde_json::Value::Bool(true), "fonts never settled");

    let out = root.join("public/resume.pdf");
    session
        .pdf(out.to_str().expect("utf-8 path"))
        .expect("print pdf");

    session.close().expect("close session");
    drop(server);

    println!("Wrote {}", out.display());
}
