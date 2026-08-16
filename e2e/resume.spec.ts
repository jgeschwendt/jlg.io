import { expect, test } from './fixtures';
import { visit } from './helpers';

test.describe('/resume', () => {
  test('renders the sheet', async ({ page }) => {
    await visit(page, '/resume');

    await expect(page).toHaveTitle('Joshua L Geschwendt—Résumé');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Joshua L Geschwendt');

    for (const section of ['Experience', 'Education', 'Contact']) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }

    // The oldest entry is the one the `flex-col-reverse` ordering puts last, so
    // asserting it covers the whole array having rendered.
    await expect(page.getByRole('heading', { level: 3, name: /Springthrough/u })).toBeVisible();

    // One <li> per role in the experience <ol>, each with its own "Stack:" line.
    const roles = await page.locator('ol > li').count();

    expect(roles).toBeGreaterThan(1);
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(roles);
    await expect(page.getByText('Stack:', { exact: true })).toHaveCount(roles);

    await expect(page.locator('footer a[href^="mailto:"]').first()).toBeVisible();
  });

  test('the close control returns to the home page', async ({ page }) => {
    await visit(page, '/resume');

    await expect(async () => {
      await page.getByRole('link', { name: 'Close résumé' }).click();
      await expect(page).toHaveURL('/');
    }).toPass({ timeout: 30_000 });
  });

  test('Escape returns to the home page', async ({ page }) => {
    await visit(page, '/resume');

    // Reachable by JS only: `Close` registers a document-level keydown listener
    // in an effect and calls `router.push`. If the client bundle never ran, or
    // never hydrated, this key press goes nowhere.
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page).toHaveURL('/');
    }).toPass({ timeout: 30_000 });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Joshua L Geschwendt');
  });
});
