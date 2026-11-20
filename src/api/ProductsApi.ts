import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thin client for the DummyJSON API. Tests call readable methods
 * (getProduct, addProduct) instead of building URLs everywhere.
 */
export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  getProduct(id: number): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  listProducts(limit = 10, skip = 0): Promise<APIResponse> {
    return this.request.get('/products', { params: { limit, skip } });
  }

  search(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query } });
  }

  addProduct(body: { title: string; price: number; category?: string }): Promise<APIResponse> {
    return this.request.post('/products/add', { data: body });
  }

  updateProduct(id: number, body: Record<string, unknown>): Promise<APIResponse> {
    return this.request.put(`/products/${id}`, { data: body });
  }

  deleteProduct(id: number): Promise<APIResponse> {
    return this.request.delete(`/products/${id}`);
  }
}
