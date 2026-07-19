import { test, expect } from '@playwright/test';

test('login and book appointment', async ({ page, request }) => {
  // Ensure backend is reachable
  const api = 'http://127.0.0.1:8001';
  // Login via API to get token
  const login = await request.post(`${api}/login`, { data: { username: 'demo', password: 'demo' } });
  expect(login.ok()).toBeTruthy();
  const body = await login.json();
  expect(body.token).toBeTruthy();
  const token = body.token;

  // Set token in localStorage then open page
  await page.addInitScript((t) => { localStorage.setItem('aura_token', t); }, token);
  await page.goto('/');

  // Open Book modal
  await page.click('text=Book');
  await page.fill('input[placeholder="Full name"]', 'Playwright User');
  await page.fill('input[placeholder="Phone"]', '1112223333');
  // select first doctor
  await page.selectOption('select', { index: 1 });
  // fill date and time
  await page.fill('input[type="date"]', '2026-07-30');
  await page.fill('input[type="time"]', '10:30');
  await page.fill('textarea[placeholder="Symptoms"]', 'testing from playwright');
  await page.click('button:has-text("Book")');

  // Wait for appointment modal success and then go to Appointments page
  await page.waitForTimeout(1500);
  await page.click('text=Appointments');
  await page.waitForSelector('text=Playwright User');
  const found = await page.locator('text=Playwright User').count();
  expect(found).toBeGreaterThan(0);
});
