import { expect, test } from './fixtures';
import { HOME_LINKS, visit } from './helpers';

test.describe('/', () => {
  test('renders the statement and the icon links', async ({ page }) => {
    await visit(page, '/');

    await expect(page).toHaveTitle('Joshua L Geschwendt—Software Engineer');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Joshua L Geschwendt');

    const statement = page.locator('main p').first();

    await expect(statement).toContainText('seasoned software engineer');
    await expect(statement).toContainText('years of professional experience');
    await expect(statement).toContainText('West Michigan');
    await expect(statement).toContainText('AI augmented software');

    // `Statement` splits the sentence on spaces and swaps two words for links —
    // the years figure and "AI". Both point back at `/`.
    const inline = statement.getByRole('link');

    await expect(inline).toHaveCount(2);
    await expect(inline.nth(1)).toHaveText('AI');

    for (const [label, href] of HOME_LINKS) {
      await expect(page.getByRole('link', { exact: true, name: label })).toHaveAttribute(
        'href',
        href,
      );
    }

    // The monogram is the only <svg> `main` renders directly.
    await expect(page.locator('main svg path').first()).toBeAttached();
  });

  test('the description metadata is derived per request', async ({ page }) => {
    await visit(page, '/');

    const description = page.locator('meta[name="description"]');

    await expect(description).toHaveAttribute('content', /seasoned software engineer/u);
  });

  test('navigates to the résumé client-side and back', async ({ page }) => {
    await visit(page, '/');

    // Nothing here is reachable without hydration: the anchor is
    // `preventDefault`ed by next/link and the router does the navigation. It can
    // land mid-hydration, where the handler is attached but the router cannot
    // act yet, so retry the click as a unit.
    await expect(async () => {
      await page.getByRole('link', { exact: true, name: 'Resume' }).click();
      await expect(page).toHaveURL('/resume');
    }).toPass({ timeout: 30_000 });

    await expect(page.getByRole('link', { name: 'Close résumé' })).toBeVisible();

    await page.goBack();

    // `Main` keeps `hasPlayed` at module scope, so the entrance does not replay
    // on a return navigation — the content is there either way.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Joshua L Geschwendt');
  });
});
