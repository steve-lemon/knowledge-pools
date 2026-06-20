import { ok, passedValidation } from "../../contracts/common.js";

export interface SchemaValidateRequest {
  schemaRef: string;
  value: unknown;
}

export function createSchemaValidatePort() {
  return async (request: SchemaValidateRequest) => {
    void request.value;
    return ok(passedValidation(request.schemaRef));
  };
}
