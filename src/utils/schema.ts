import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/** Returns a readable list of schema errors; an empty array means the data is valid. */
export function schemaErrors(schema: object, data: unknown): string[] {
  const validate = ajv.compile(schema);
  return validate(data) ? [] : (validate.errors ?? []).map(e => `${e.instancePath || '(root)'} ${e.message}`);
}
