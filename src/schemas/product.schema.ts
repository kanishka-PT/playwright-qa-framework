/** JSON Schema for one product. If the API drops or renames a field, the schema test fails. */
export const productSchema = {
  type: 'object',
  required: ['id', 'title', 'price', 'category', 'stock'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    category: { type: 'string' },
    price: { type: 'number', exclusiveMinimum: 0 },
    stock: { type: 'integer', minimum: 0 },
    rating: { type: 'number', minimum: 0, maximum: 5 },
  },
} as const;
