import type { Page, Response } from '@playwright/test';

// Everything in here exists because a `*.spec.ts` may not contain a single
// TypeScript type annotation — bun's loader fails the whole file with an opaque
// `BuildMessage {}` and Playwright then reports "No tests found", naming
// nothing. Imported modules are transformed normally, so anything that needs
// types lives here.

/** `dev` under `bun run coverage:dev`, `prod` under `bun run coverage`. */
export const COVERAGE_MODE = process.env['COVERAGE_MODE'] ?? '';

/** The four icon links on the home page, in render order. */
export const HOME_LINKS: readonly (readonly [label: string, href: string])[] = [
  ['Email', 'mailto:joshua@geschwendt.com'],
  ['Resume', '/resume'],
  ['GitHub', 'https://github.com/jgeschwendt'],
  ['LinkedIn', 'https://www.linkedin.com/in/jgeschwendt'],
];

/**
 * A navigation's own response — `page.goto` resolves to `null` only for
 * same-document navigations, which no test here performs.
 */
export const visit = async (page: Page, path: string): Promise<Response> => {
  const response = await page.goto(path);

  if (response === null) {
    throw new Error(`No response for ${path}`);
  }

  return response;
};

/**
 * The per-request CSP minted in `src/server/proxy/content-security-policy.ts`,
 * as `[directive, value]` pairs. Throws if the header is absent at all, which
 * is the interesting failure.
 */
export const contentSecurityPolicy = (headers: Record<string, string>): Map<string, string> => {
  const header = headers['content-security-policy'];

  if (header === undefined) {
    throw new Error('No content-security-policy header on the response');
  }

  return new Map(
    header
      .split(';')
      .map((directive) => directive.trim())
      .filter((directive) => directive.length > 0)
      .map((directive) => {
        const [name, ...rest] = directive.split(/\s+/u);
        return [name ?? '', rest.join(' ')] as const;
      }),
  );
};

/** The `'nonce-…'` value out of a parsed policy's `script-src`. */
export const scriptNonce = (policy: Map<string, string>): string => {
  const nonce = /'nonce-(?<nonce>[\w+/=]+)'/u.exec(policy.get('script-src') ?? '')?.groups?.[
    'nonce'
  ];

  if (nonce === undefined) {
    throw new Error(`No nonce in script-src: ${policy.get('script-src') ?? '(absent)'}`);
  }

  return nonce;
};
