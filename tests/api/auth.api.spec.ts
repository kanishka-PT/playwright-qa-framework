import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/utils/env';

test.describe('Auth API', () => {
  test('login returns a token that works on a protected endpoint', { tag: ['@smoke', '@api'] }, async ({ authApi }) => {
    const token = await authApi.token(env.apiUser, env.apiPassword);   // request 1: get token
    expect(token).toBeTruthy();

    const me = await authApi.me(token);                                   // request 2: use token
    expect(me.status()).toBe(200);
    expect((await me.json()).username).toBe(env.apiUser);
  });

  test('wrong password is rejected', { tag: '@api' }, async ({ authApi }) => {
    const res = await authApi.login(env.apiUser, 'wrong-password');
    expect(res.status()).toBe(400);
  });

  test('protected endpoint without a valid token is rejected', { tag: '@api' }, async ({ authApi }) => {
    const res = await authApi.me('not-a-real-token');
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBeGreaterThanOrEqual(400);   // a well-designed API returns 401 here
  });
});
