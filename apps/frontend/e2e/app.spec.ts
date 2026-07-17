import { expect, test } from '@playwright/test';

test('unauthenticated users are redirected to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
});

test('a public @username profile renders when the backend has one', async ({ page }) => {
  await page.route('**/profiles/testuser', async (route) => {
    await route.fulfill({
      json: {
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
  });

  await page.goto('/@testuser');
  await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible();
});

test('an unknown @username shows a not-found message', async ({ page }) => {
  await page.route('**/profiles/ghost', async (route) => {
    await route.fulfill({ status: 404, json: { message: 'Not found' } });
  });

  await page.goto('/@ghost');
  await expect(page.getByText("This profile doesn't exist.")).toBeVisible();
});
