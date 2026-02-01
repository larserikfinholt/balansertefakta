import { test, expect, request } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Authentication API', () => {
  test('should login with valid credentials', async () => {
    const apiContext = await request.newContext({ baseURL: API_URL });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
              user { id displayName email authLevel }
            }
          }
        `,
        variables: {
          input: { email: 'vegard@test.no', password: 'password123' },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.login.token).toBeTruthy();
    expect(json.data.login.user.displayName).toBe('Venstre-Vegard');
    expect(json.data.login.user.authLevel).toBe('VERIFIED');
  });

  test('should reject invalid credentials', async () => {
    const apiContext = await request.newContext({ baseURL: API_URL });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) { token }
          }
        `,
        variables: {
          input: { email: 'vegard@test.no', password: 'wrongpassword' },
        },
      },
    });

    const json = await response.json();
    expect(json.errors).toBeTruthy();
    expect(json.errors[0].message).toContain('Invalid email or password');
  });

  test('should register a new user', async () => {
    const apiContext = await request.newContext({ baseURL: API_URL });
    const uniqueEmail = `e2e-${Date.now()}@test.no`;

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user { id displayName email authLevel }
            }
          }
        `,
        variables: {
          input: {
            email: uniqueEmail,
            password: 'password123',
            displayName: 'E2E Test User',
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.register.token).toBeTruthy();
    expect(json.data.register.user.email).toBe(uniqueEmail);
    expect(json.data.register.user.authLevel).toBe('VERIFIED');
  });

  test('should return current user with valid token', async () => {
    const apiContext = await request.newContext({ baseURL: API_URL });

    // First login to get token
    const loginResponse = await apiContext.post('/graphql', {
      data: {
        query: `mutation { login(input: { email: "henrik@test.no", password: "password123" }) { token } }`,
      },
    });
    const token = (await loginResponse.json()).data.login.token;

    // Use token to query me
    const meResponse = await apiContext.post('/graphql', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        query: `query { me { id displayName email } }`,
      },
    });

    const json = await meResponse.json();
    expect(json.data.me.displayName).toBe('Høyre-Henrik');
  });

  test('should return null for me query without token', async () => {
    const apiContext = await request.newContext({ baseURL: API_URL });

    const response = await apiContext.post('/graphql', {
      data: { query: `query { me { id } }` },
    });

    const json = await response.json();
    expect(json.data.me).toBeNull();
  });
});

test.describe('Authentication UI', () => {
  test('should show login/register links when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Logg inn' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registrer' })).toBeVisible();
  });

  test('should login and show user name in header', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.getByLabel('E-post').fill('vegard@test.no');
    await page.getByLabel('Passord').fill('password123');
    await page.getByRole('button', { name: 'Logg inn' }).click();

    // Wait for navigation to complete
    await page.waitForURL('/');

    // Should redirect and show user name
    await expect(page.getByText('Venstre-Vegard')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logg ut' })).toBeVisible();
  });

  test('should logout and show login links again', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('E-post').fill('vegard@test.no');
    await page.getByLabel('Passord').fill('password123');
    await page.getByRole('button', { name: 'Logg inn' }).click();
    
    // Wait for navigation after login
    await page.waitForURL('/');
    await expect(page.getByText('Venstre-Vegard')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logg ut' }).click();

    // Should show login links again
    await expect(page.getByRole('link', { name: 'Logg inn' })).toBeVisible();
  });
});
