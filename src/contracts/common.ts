export type IsoDateTime = string;
export type SchemaVersion = string;
export type StoragePath = string;
export type RefString = string;
export type ContentHash = `sha256:${string}`;
export type MediaHint = "md" | "txt" | "json" | string;

export type ValidationStatus =
  | "passed"
  | "passed_with_warnings"
  | "failed"
  | "not_run";

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
  ref?: RefString;
}

export interface ValidationSummary {
  status: ValidationStatus;
  schemaRef: RefString;
  checkedAt?: IsoDateTime;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ContractError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export type Result<T, E extends ContractError = ContractError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err(
  code: string,
  message: string,
  retryable = false,
  details?: Record<string, unknown>
): Result<never> {
  return { ok: false, error: { code, message, retryable, details } };
}

export function passedValidation(schemaRef: RefString): ValidationSummary {
  return {
    status: "passed",
    schemaRef,
    checkedAt: new Date().toISOString(),
    errors: [],
    warnings: []
  };
}
