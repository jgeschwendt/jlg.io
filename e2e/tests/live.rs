// `#[ignore]`d: these drive a real browser against the deployed site, so they
// need network and they assert production, not the working tree. Run them
// deliberately with `cargo test -- --ignored`.

use harness::Session;

const HREFS: &str = "Array.from(document.querySelectorAll('a'), (a) => a.href)";

#[ignore]
#[test]
fn home_links() {
    let session = Session::ensure("harness-live-a").expect("daemon");
    session.navigate("https://jlg.io").expect("navigate");

    let value = session.eval(HREFS).expect("eval");
    let hrefs: Vec<&str> = value
        .as_array()
        .expect("hrefs array")
        .iter()
        .map(|h| h.as_str().expect("href string"))
        .collect();

    session.close().expect("close");

    assert!(hrefs.contains(&"mailto:joshua@geschwendt.com"), "{hrefs:?}");
    assert!(
        hrefs.contains(&"https://github.com/jgeschwendt"),
        "{hrefs:?}"
    );
    assert!(hrefs.iter().any(|h| h.ends_with("/resume")), "{hrefs:?}");
    assert!(
        hrefs
            .iter()
            .any(|h| h.contains("linkedin.com/in/jgeschwendt")),
        "{hrefs:?}"
    );
}

#[ignore]
#[test]
fn resume_title() {
    let session = Session::ensure("harness-live-b").expect("daemon");
    session.navigate("https://jlg.io/resume").expect("navigate");

    let title = session.title().expect("title");
    session.close().expect("close");

    assert!(title.contains("Résumé"), "{title:?}");
}
