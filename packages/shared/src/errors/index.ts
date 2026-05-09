export type GovernedErrorCategory =
  | "unsupported_dataset"
  | "unsupported_field"
  | "row_limit_exceeded"
  | "unsafe_canvas_spec"
  | "live_adapter_unavailable"
  | "validation_error";

export class GovernedError extends Error {
  readonly category: GovernedErrorCategory;

  constructor(category: GovernedErrorCategory, message: string) {
    super(message);
    this.name = "GovernedError";
    this.category = category;
  }
}

export class UnsupportedDatasetError extends GovernedError {
  constructor(message: string) {
    super("unsupported_dataset", message);
    this.name = "UnsupportedDatasetError";
  }
}

export class UnsupportedFieldError extends GovernedError {
  constructor(message: string) {
    super("unsupported_field", message);
    this.name = "UnsupportedFieldError";
  }
}

export class RowLimitExceededError extends GovernedError {
  constructor(message: string) {
    super("row_limit_exceeded", message);
    this.name = "RowLimitExceededError";
  }
}

export class UnsafeCanvasSpecError extends GovernedError {
  constructor(message: string) {
    super("unsafe_canvas_spec", message);
    this.name = "UnsafeCanvasSpecError";
  }
}

export class LiveAdapterUnavailableError extends GovernedError {
  constructor(message: string) {
    super("live_adapter_unavailable", message);
    this.name = "LiveAdapterUnavailableError";
  }
}

export class GovernedValidationError extends GovernedError {
  constructor(message: string) {
    super("validation_error", message);
    this.name = "GovernedValidationError";
  }
}

export function isGovernedError(error: unknown): error is GovernedError {
  return error instanceof GovernedError;
}
