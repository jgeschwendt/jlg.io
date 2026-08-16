import { expect, test } from './fixtures';
import { contentSecurityPolicy, scriptNonce, visit } from './helpers';

test.describe('routes', () => {
  test('/robots.txt is generated from src/app/robots.ts', async ({ page }) => {
    const response = await visit(page, '/robots.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');

    const body = await response.text();

    expect(body).toContain('User-Agent: *');
    expect(body).toContain('Allow: /$');
    expect(body).toContain('Disallow: /');
  });

  test('an unknown path is a 404', async ({ page }) => {
    const response = await visit(page, '/no-such-page');

    expect(response.status()).toBe(404);
    await expect(page.locator('body')).toContainText('could not be found');
  });

  test('/api/coverage answers while COVERAGE is armed', async ({ request }) => {
    const response = await request.get('/api/coverage');

    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(typeof (await response.json())).toBe('object');
  });
});

test.describe('content security policy', () => {
  for (const path of ['/', '/resume']) {
    test(`${path} carries a per-request nonce`, async ({ request }) => {
      const response = await request.get(path);
      const policy = contentSecurityPolicy(response.headers());

      expect(policy.get('default-src')).toBe("'none'");
      expect(policy.get('base-uri')).toBe("'self'");
      expect(policy.get('form-action')).toBe("'self'");
      expect(policy.get('frame-src')).toBe("'none'");
      expect(policy.has('upgrade-insecure-requests')).toBe(true);

      // The nonce on the wire has to be the one Next stamped onto the markup it
      // rendered in the same response — a mismatch is exactly what browser CSP
      // enforcement would catch, and the suite runs with `bypassCSP` (see
      // playwright.config.ts). Asserting it here is the replacement.
      const nonce = scriptNonce(policy);

      expect(await response.text()).toContain(`nonce="${nonce}"`);

      // Minted per request, so two loads of the same route must not share one.
      const repeat = await request.get(path);
      const again = contentSecurityPolicy(repeat.headers());

      expect(scriptNonce(again)).not.toBe(nonce);
    });
  }
});
