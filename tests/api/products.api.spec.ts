import { test, expect } from '../../src/fixtures/test';
import { productSchema } from '../../src/schemas/product.schema';
import { schemaErrors } from '../../src/utils/schema';
import { uniqueTitle } from '../../src/utils/dataFactory';

test.describe('Products API', () => {
  test('GET a product by id', { tag: ['@smoke', '@api'] }, async ({ productsApi }) => {
    const res = await productsApi.getProduct(1);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.price).toBeGreaterThan(0);
  });

  test('product response matches the JSON schema', { tag: '@api' }, async ({ productsApi }) => {
    const body = await (await productsApi.getProduct(1)).json();
    expect(schemaErrors(productSchema, body)).toEqual([]);
  });

  test('list supports limit and skip (pagination)', { tag: '@api' }, async ({ productsApi }) => {
    const res = await productsApi.listProducts(5, 10);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.products).toHaveLength(5);
    expect(body.limit).toBe(5);
    expect(body.skip).toBe(10);
    expect(body.products[0].id).toBe(11);
  });

  test('search returns matching products', { tag: '@api' }, async ({ productsApi }) => {
    const body = await (await productsApi.search('phone')).json();
    expect(body.total).toBeGreaterThan(0);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('unknown product returns 404', { tag: '@api' }, async ({ productsApi }) => {
    const res = await productsApi.getProduct(999999);
    expect(res.status()).toBe(404);
  });

  test('create, update and delete a product (CRUD)', { tag: '@api' }, async ({ productsApi }) => {
    // DummyJSON simulates writes: it echoes the result but does not really store it.
    const title = uniqueTitle();
    const created = await productsApi.addProduct({ title, price: 19.99, category: 'qa' });
    expect(created.ok()).toBeTruthy();
    const product = await created.json();
    expect(product.title).toBe(title);
    expect(product.id).toBeTruthy();

    const updated = await productsApi.updateProduct(1, { price: 25 });
    expect(updated.ok()).toBeTruthy();
    expect((await updated.json()).price).toBe(25);

    const deleted = await productsApi.deleteProduct(1);
    expect(deleted.ok()).toBeTruthy();
    expect((await deleted.json()).isDeleted).toBe(true);
  });
});
