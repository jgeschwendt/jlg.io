//! A synchronous client for the `agent-browser` daemon, driving a real Chrome
//! from Rust over the daemon's Unix socket rather than through its CLI. The
//! CLI would do for a one-shot command, but a coverage run needs one browser
//! context held across a dozen navigations — every `agent-browser` invocation
//! is a fresh round trip through argument parsing and output formatting, and
//! the page state that matters here (`window.__coverage__`) only survives
//! inside a single session.

pub mod cdp;
pub mod kit;
pub mod server;

use serde::Deserialize;
use serde_json::{Value, json};
use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

const MAX_ATTEMPTS: u32 = 5;
const RETRY_STEP: Duration = Duration::from_millis(200);

static SEQ: AtomicU64 = AtomicU64::new(0);

#[derive(Debug)]
pub enum Error {
    Daemon(String),
    Io(std::io::Error),
    Protocol(String),
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::Daemon(m) => write!(f, "daemon: {m}"),
            Error::Io(e) => write!(f, "io: {e}"),
            Error::Protocol(m) => write!(f, "protocol: {m}"),
        }
    }
}

impl std::error::Error for Error {}

impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Error::Io(e)
    }
}

#[derive(Deserialize)]
struct Reply {
    #[serde(default)]
    data: Value,
    #[serde(default)]
    error: Option<String>,
    success: bool,
}

pub struct Session {
    name: String,
    socket: PathBuf,
}

impl Session {
    /// Connects to an existing daemon for `name`, spawning one if the socket
    /// does not answer. A killed daemon leaves its `.sock` file behind, so
    /// "the file exists" is not evidence of a live session — only a successful
    /// `connect` is.
    pub fn ensure(name: &str) -> Result<Self, Error> {
        let session = Session {
            name: name.to_string(),
            socket: socket_path(name),
        };
        if UnixStream::connect(&session.socket).is_err() {
            session.bootstrap()?;
        }
        Ok(session)
    }

    /// One step back through the session history. A client-side route pop, not
    /// a reload, when the router owns the entry — callers assert which.
    pub fn back(&self) -> Result<(), Error> {
        self.send("back", json!({})).map(|_| ())
    }

    /// The browser-level CDP endpoint, which is what `Target.*` and a flat
    /// per-target attach need — a page-level endpoint cannot reach either.
    pub fn cdp_url(&self) -> Result<String, Error> {
        let data = self.send("cdp_url", json!({}))?;
        string(&data, "cdpUrl")
    }

    /// Tears down the entire daemon, not just this page: the socket and pid
    /// files vanish with it, so nothing else may be sharing the session name.
    pub fn close(&self) -> Result<(), Error> {
        self.send("close", json!({})).map(|_| ())
    }

    /// Values come back structurally (`returnByValue`) and promises are awaited
    /// before the reply is sent (`awaitPromise`), so `fetch(…).then(…)` is a
    /// legal script here — but a bare top-level `await` is not, because the
    /// expression is evaluated, not run as a module.
    pub fn eval(&self, script: &str) -> Result<Value, Error> {
        let data = self.send("evaluate", json!({ "script": script }))?;
        field(&data, "result")
    }

    /// A hard navigation: it discards the JS heap, and with it any
    /// `window.__coverage__` accumulated since the last one.
    pub fn navigate(&self, url: &str) -> Result<(), Error> {
        self.send("navigate", json!({ "url": url })).map(|_| ())
    }

    /// `Page.printToPDF` on the current page, written by the daemon to `path`.
    /// The action's defaults are already the interesting options: CDP's default
    /// paper size is Letter (8.5×11in) and the daemon turns `printBackground`
    /// on unless told otherwise.
    pub fn pdf(&self, path: &str) -> Result<(), Error> {
        self.send("pdf", json!({ "path": path })).map(|_| ())
    }

    /// Retries transient socket faults, then re-bootstraps once if the daemon
    /// turns out to be gone (the daemon exits on idle, so a session that worked
    /// a moment ago can be unreachable on the next call).
    pub fn send(&self, action: &str, params: Value) -> Result<Value, Error> {
        let mut request = json!({ "action": action, "id": next_id() });
        if let (Some(target), Value::Object(extra)) = (request.as_object_mut(), params) {
            target.extend(extra);
        }

        let mut respawned = false;
        let mut attempt = 1;
        loop {
            match self.round_trip(&request) {
                Ok(reply) if reply.success => return Ok(reply.data),
                Ok(reply) => {
                    return Err(Error::Protocol(
                        reply.error.unwrap_or_else(|| format!("{action} failed")),
                    ));
                }
                Err(e) if unreachable(&e) && !respawned => {
                    respawned = true;
                    self.bootstrap()?;
                }
                Err(e) if transient(&e) && attempt < MAX_ATTEMPTS => {
                    std::thread::sleep(RETRY_STEP * attempt);
                    attempt += 1;
                }
                Err(e) => return Err(e),
            }
        }
    }

    pub fn title(&self) -> Result<String, Error> {
        let data = self.send("title", json!({}))?;
        string(&data, "title")
    }

    pub fn url(&self) -> Result<String, Error> {
        let data = self.send("url", json!({}))?;
        string(&data, "url")
    }

    /// `open about:blank` is the cheapest command that forces the daemon and
    /// its browser into existence; it blocks until both are up, which is what
    /// makes the very next socket connect safe.
    fn bootstrap(&self) -> Result<(), Error> {
        let status = Command::new(binary())
            .args(["--session", &self.name, "open", "about:blank"])
            .status()
            .map_err(|e| Error::Daemon(format!("spawn agent-browser: {e}")))?;
        if !status.success() {
            return Err(Error::Daemon(format!("agent-browser open exited {status}")));
        }
        Ok(())
    }

    /// One connection per request. The daemon speaks newline-delimited JSON and
    /// answers each request on the connection that carried it, so there is no
    /// multiplexing to keep straight and no reason to hold a socket open.
    fn round_trip(&self, request: &Value) -> Result<Reply, Error> {
        let stream = UnixStream::connect(&self.socket)?;
        let mut writer = &stream;
        writer.write_all(serde_json::to_string(request).unwrap().as_bytes())?;
        writer.write_all(b"\n")?;
        writer.flush()?;

        let mut line = String::new();
        BufReader::new(&stream).read_line(&mut line)?;
        serde_json::from_str(&line).map_err(|e| Error::Protocol(format!("{e}: {line:?}")))
    }
}

/// `agent-browser` is a bun global install (`bun add -g`), on PATH via
/// `~/.bun/bin` — its node-shebang bin resolves to bun through the `node`
/// symlink both machines and CI carry. `AGENT_BROWSER_BIN` is the escape
/// hatch for running the binary from somewhere else.
fn binary() -> String {
    std::env::var("AGENT_BROWSER_BIN").unwrap_or_else(|_| "agent-browser".to_string())
}

/// Every reply nests its payload under `data.<key>` alongside a `lifecycle`
/// block, so callers never see the value at the top level.
fn field(data: &Value, key: &str) -> Result<Value, Error> {
    data.get(key)
        .cloned()
        .ok_or_else(|| Error::Protocol(format!("missing data.{key} in {data}")))
}

fn next_id() -> String {
    format!(
        "{}-{}",
        std::process::id(),
        SEQ.fetch_add(1, Ordering::Relaxed)
    )
}

fn socket_path(name: &str) -> PathBuf {
    let dir = std::env::var_os("AGENT_BROWSER_SOCKET_DIR")
        .map(PathBuf::from)
        .or_else(|| {
            std::env::var_os("XDG_RUNTIME_DIR").map(|d| PathBuf::from(d).join("agent-browser"))
        })
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".agent-browser")))
        .unwrap_or_else(|| PathBuf::from(".agent-browser"));
    dir.join(format!("{name}.sock"))
}

fn string(data: &Value, key: &str) -> Result<String, Error> {
    match field(data, key)? {
        Value::String(s) => Ok(s),
        other => Err(Error::Protocol(format!(
            "data.{key} is not a string: {other}"
        ))),
    }
}

/// Faults worth another attempt on the same daemon. The `line 1 column 0` case
/// is an empty read: the daemon accepted the connection and closed it without
/// answering, which it does while it is still coming up.
fn transient(e: &Error) -> bool {
    let Error::Io(io) = e else {
        return matches!(e, Error::Protocol(m) if m.contains("line 1 column 0"));
    };
    matches!(
        io.kind(),
        std::io::ErrorKind::BrokenPipe
            | std::io::ErrorKind::ConnectionReset
            | std::io::ErrorKind::UnexpectedEof
            | std::io::ErrorKind::WouldBlock
    ) || io.raw_os_error() == Some(35)
}

/// Nobody is listening: either the socket file is gone, or it is a stale one
/// left by a daemon that was killed rather than closed.
fn unreachable(e: &Error) -> bool {
    matches!(
        e,
        Error::Io(io)
            if matches!(
                io.kind(),
                std::io::ErrorKind::ConnectionRefused | std::io::ErrorKind::NotFound
            )
    )
}
