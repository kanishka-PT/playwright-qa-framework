import { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  login(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth/login', { data: { username, password, expiresInMins: 30 } });
  }

  me(token: string): Promise<APIResponse> {
    return this.request.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  }

  /** Logs in and returns just the token, for tests that need an authorised call. */
  async token(username: string, password: string): Promise<string> {
    const res = await this.login(username, password);
    if (!res.ok()) throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).accessToken;
  }
}
