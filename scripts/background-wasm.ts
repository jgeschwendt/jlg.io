import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Keep the CLI in lockstep with the wasm-bindgen crate version cargo resolved.
const lock = readFileSync('crates/background/Cargo.lock', 'utf8');
const version = /name = "wasm-bindgen"\nversion = "(?<version>[^"]+)"/u.exec(
  lock,
)?.groups?.['version'];

if (version === undefined) {
  throw new Error('wasm-bindgen missing from crates/background/Cargo.lock');
}

const run = (command: string, commandArguments: readonly string[]): void => {
  const result = spawnSync(command, commandArguments, {
    // stable: the repo-external RUSTUP_TOOLCHAIN pin predates bevy's MSRV.
    env: { ...process.env, RUSTUP_TOOLCHAIN: 'stable' },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${commandArguments.join(' ')} exited with ${String(result.status)}`,
    );
  }
};

const probe = spawnSync('wasm-bindgen', ['--version'], { encoding: 'utf8' });
const installed = probe.error === undefined ? probe.stdout : '';

if (!installed.includes(version)) {
  run('cargo', [
    'install',
    'wasm-bindgen-cli',
    '--locked',
    '--version',
    version,
  ]);
}

run('cargo', [
  'build',
  '--manifest-path',
  'crates/background/Cargo.toml',
  '--release',
  '--target',
  'wasm32-unknown-unknown',
]);

run('wasm-bindgen', [
  '--no-typescript',
  '--out-dir',
  'public/background',
  '--out-name',
  'background',
  '--target',
  'web',
  'crates/background/target/wasm32-unknown-unknown/release/background.wasm',
]);

console.log('Wrote public/background/background.js + background_bg.wasm');
