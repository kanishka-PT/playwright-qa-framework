import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** One place for every environment value. Defaults point at the public demo sites. */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiUrl: process.env.API_URL ?? 'https://dummyjson.com',
  standardUser: process.env.STANDARD_USER ?? 'standard_user',
  lockedUser: process.env.LOCKED_USER ?? 'locked_out_user',
  uiPassword: process.env.UI_PASSWORD ?? 'secret_sauce',
  apiUser: process.env.API_USER ?? 'emilys',
  apiPassword: process.env.API_PASSWORD ?? 'emilyspass',
  isCI: !!process.env.CI,
};

export const AUTH_FILE = path.resolve(__dirname, '../../.auth/standard-user.json');
