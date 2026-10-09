'use strict';

// Makes every bundled copy of an instrumented module count into one record.
//
// Turbopack emits a module into each chunk that needs it — the logger lands in
// both the instrumentation and proxy chunks, client components in the SSR and
// RSC layers — and each copy runs the plugin's init:
//
//   coverage[path] && HASH === coverage[path].$hash || (coverage[path] = fresh)
//
// The stored record carries `hash`, never `$hash`, so that guard never holds and
// each copy that loads replaces the record with zeroed counters, erasing
// whatever an earlier copy counted. (observed 2026-10-08 ·
// swc-plugin-coverage-instrument 0.0.32: `register()`'s log() call printed,
// yet logger.ts reported log at 0 hits)
//
// Installed ahead of every module, `__coverage__` refuses a replacement whose
// hash matches the record it already holds; the init then reads back the live
// record, and all copies share its counters. A changed hash still replaces.

if (
  (process.env.COVERAGE === '1' || process.env.COVERAGE_FLUSH === '1') &&
  !globalThis.__coverage__
) {
  globalThis.__coverage__ = new Proxy(
    {},
    {
      set(records, path, record) {
        if (!(path in records) || records[path].hash !== record.hash) {
          records[path] = record;
        }
        return true;
      },
    },
  );
}
