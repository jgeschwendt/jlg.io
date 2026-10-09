//! The Next server a harness binary drives, owned so that a failed assertion
//! takes it down with it: every check in the binaries panics, and a panic
//! unwinds through `main`'s locals.

use std::io::{Read, Write};
use std::net::TcpStream;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

// `localhost`, not `127.0.0.1`: Next 16's dev server rejects requests whose
// Host is not an allowed dev origin with a 403, which starves the page of its
// chunks.
pub const HOST: &str = "localhost";
const READY_TIMEOUT: Duration = Duration::from_secs(300);
// How long a SIGTERM'd server gets to run its exit hooks — the bunfig-preloaded
// coverage flush among them — before it is killed outright.
const STOP_GRACE: Duration = Duration::from_secs(10);

/// The crate lives at `crates/harness`, so the repo root is two levels up. This
/// is resolved at compile time rather than from the working directory because
/// `cargo run --manifest-path` leaves the caller's cwd untouched.
pub fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("crates/harness is two levels below the repo root")
        .to_path_buf()
}

pub struct Server {
    child: Child,
    port: u16,
}

impl Server {
    pub fn start(
        program: &str,
        args: &[&str],
        envs: &[(&str, &str)],
        root: &Path,
        port: u16,
    ) -> Self {
        let mut command = Command::new(program);
        command
            .args(args)
            .current_dir(root)
            // Its own process group: `next` starts helper processes, and
            // killing only the process we spawned would leave the port held.
            .process_group(0)
            // Both streams into the run's log: Next splits its output across
            // them, and a swallowed stdout is where a silent failure hides.
            // (since 2026-08-18 · the __next_error__ hunt found stdout nulled)
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());
        for (key, value) in envs {
            command.env(key, value);
        }
        let child = command
            .spawn()
            .expect("spawn next — run this from a repo with node_modules installed");

        Server { child, port }
    }

    /// Turbopack compiles routes lazily, so a cold dev server can take minutes
    /// before the first response. Poll rather than sleep on a guess.
    pub fn wait_ready(&self) {
        let deadline = Instant::now() + READY_TIMEOUT;
        while Instant::now() < deadline {
            if get_status(self.port, "/") == Some(200) {
                return;
            }
            std::thread::sleep(Duration::from_millis(500));
        }
        panic!(
            "next never answered on {HOST}:{} within {READY_TIMEOUT:?}",
            self.port
        );
    }
}

impl Drop for Server {
    fn drop(&mut self) {
        // Signal the group, not the process: `process_group(0)` made the
        // child's pid its own group id, so a negative pid reaches its helpers
        // too. `kill(1)` avoids a libc dependency for one signal; `--` ends its
        // options so `-<pgid>` is a target, not a flag — the bare form left a CI
        // server untouched until the grace ran out, its coverage flush unwritten.
        // (observed 2026-10-09 · coverage run 37949298563, 10.5s stall)
        let group = format!("-{}", self.child.id());
        match Command::new("kill")
            .args(["-s", "TERM", "--", &group])
            .output()
        {
            Ok(out) if out.status.success() => {}
            Ok(out) => eprintln!(
                "[harness] kill -s TERM -- {group} failed: {}",
                String::from_utf8_lossy(&out.stderr).trim()
            ),
            Err(error) => eprintln!("[harness] kill -s TERM -- {group}: {error}"),
        }
        let deadline = Instant::now() + STOP_GRACE;
        while Instant::now() < deadline && matches!(self.child.try_wait(), Ok(None)) {
            std::thread::sleep(Duration::from_millis(50));
        }
        if matches!(self.child.try_wait(), Ok(None)) {
            eprintln!(
                "[harness] server {group} outlived its {STOP_GRACE:?} SIGTERM grace — killing it; exit hooks (the coverage flush) did not run"
            );
        }
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// A hand-rolled readiness probe. One request, one status line, no HTTP client
/// in the dependency set — everything else the binaries need from the network
/// they get through the browser. One `read`, never read-to-EOF: bun's runtime
/// serves the whole response and then holds the socket open despite
/// `Connection: close`, so waiting for EOF times out against every
/// `bun --bun next` server while node's closes promptly.
/// (observed 2026-08-18 · resume-pdf's `next start` answered instantly but
/// wait_ready timed out at 300s reading to EOF)
pub fn get_status(port: u16, path: &str) -> Option<u16> {
    get_head(port, path, &[]).map(|(status, _)| status)
}

/// One request, read only as far as the end of the response head — status
/// plus the raw header block, lowercased names and all as sent. The body is
/// never awaited, for the same reason `get_status` never reads to EOF.
pub fn get_head(port: u16, path: &str, headers: &[(&str, &str)]) -> Option<(u16, String)> {
    let mut stream = TcpStream::connect((HOST, port)).ok()?;
    stream
        .set_read_timeout(Some(Duration::from_secs(30)))
        .ok()?;
    let extra: String = headers
        .iter()
        .map(|(name, value)| format!("{name}: {value}\r\n"))
        .collect();
    stream
        .write_all(
            format!(
                "GET {path} HTTP/1.1\r\nHost: {HOST}:{port}\r\n{extra}Connection: close\r\n\r\n"
            )
            .as_bytes(),
        )
        .ok()?;

    let mut head = Vec::new();
    let mut chunk = [0u8; 4096];
    while !head.windows(4).any(|w| w == b"\r\n\r\n") {
        let read = stream.read(&mut chunk).ok()?;
        if read == 0 {
            break;
        }
        head.extend_from_slice(&chunk[..read]);
    }
    let head = String::from_utf8_lossy(&head);
    let head = head.split("\r\n\r\n").next()?.to_string();
    let status = head.split_whitespace().nth(1)?.parse().ok()?;
    Some((status, head))
}

/// A header's value out of a `get_head` block, matched case-insensitively.
pub fn header<'a>(head: &'a str, name: &str) -> Option<&'a str> {
    head.lines().skip(1).find_map(|line| {
        let (key, value) = line.split_once(':')?;
        key.trim().eq_ignore_ascii_case(name).then(|| value.trim())
    })
}
