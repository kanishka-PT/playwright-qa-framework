/** Small helpers that create unique, realistic test data without extra libraries. */
const firstNames = ['Asha', 'Ravi', 'Meera', 'Arjun', 'Kavya', 'Rohan'];
const lastNames = ['Iyer', 'Sharma', 'Nair', 'Reddy', 'Patel', 'Das'];

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export interface Customer { firstName: string; lastName: string; postalCode: string; }

export function newCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: pick(firstNames),
    lastName: pick(lastNames),
    postalCode: String(10000 + Math.floor(Math.random() * 89999)),
    ...overrides,
  };
}

export function uniqueTitle(prefix = 'QA Product'): string {
  return `${prefix} ${Date.now()}`;
}
