export class AppError extends Error {
  constructor(message, { code = "APP_ERROR", status = 400, cause } = {}) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class IntegrationUnavailableError extends AppError {
  constructor(message) {
    super(message, { code: "INTEGRATION_UNAVAILABLE", status: 503 });
    this.name = "IntegrationUnavailableError";
  }
}
