export class LLMError extends Error {
  public readonly status: number;
  public readonly type?: string;
  public readonly originalError?: unknown;

  constructor(message: string, status: number = 500, type?: string, originalError?: unknown) {
    super(message);
    this.name = 'LLMError';
    this.status = status;
    this.type = type;
    this.originalError = originalError;
  }
}
