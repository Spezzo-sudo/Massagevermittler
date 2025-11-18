/**
 * Error recovery and retry logic for resilient operations
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Execute an operation with exponential backoff retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delayMs = config.initialDelayMs!;

  for (let attempt = 0; attempt <= config.maxRetries!; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxRetries) {
        break;
      }

      // Call retry handler
      if (config.onRetry) {
        config.onRetry(attempt + 1, lastError);
      }

      console.warn(`[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed, retrying in ${delayMs}ms`, {
        error: lastError.message,
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Calculate next delay with exponential backoff
      delayMs = Math.min(delayMs * config.backoffMultiplier!, config.maxDelayMs!);
    }
  }

  throw lastError;
}

/**
 * Execute async operation with timeout
 */
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Chain multiple operations with automatic rollback on failure
 */
export async function executeTransaction<T>(
  operations: Array<{
    name: string;
    execute: () => Promise<any>;
    rollback?: () => Promise<void>;
  }>
): Promise<T[]> {
  const results: any[] = [];
  const executedOperations: typeof operations = [];

  try {
    for (const op of operations) {
      console.info(`[Transaction] Executing: ${op.name}`);
      const result = await op.execute();
      results.push(result);
      executedOperations.push(op);
    }
    return results;
  } catch (error) {
    console.error(`[Transaction] Failed at operation. Rolling back ${executedOperations.length} operations`, {
      error: error instanceof Error ? error.message : String(error),
    });

    // Rollback in reverse order
    for (let i = executedOperations.length - 1; i >= 0; i--) {
      const op = executedOperations[i];
      if (op.rollback) {
        try {
          console.info(`[Transaction] Rolling back: ${op.name}`);
          await op.rollback();
        } catch (rollbackError) {
          console.error(`[Transaction] Rollback failed for ${op.name}`, {
            error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
          });
        }
      }
    }

    throw error;
  }
}

/**
 * Decorator for retry logic on async functions
 */
export function Retry(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return executeWithRetry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Circuit breaker pattern for protecting against cascading failures
 */
export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private successThreshold: number = 2,
    private resetTimeoutMs: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeoutMs) {
        console.info('[CircuitBreaker] Attempting to recover');
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'half-open') {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          console.info('[CircuitBreaker] Circuit closed - service recovered');
          this.state = 'closed';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        console.warn('[CircuitBreaker] Circuit opened - too many failures', {
          failures: this.failureCount,
          threshold: this.failureThreshold,
        });
        this.state = 'open';
      }

      throw error;
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Idempotent operation wrapper - ensures operation succeeds at least once
 */
export class IdempotentOperation {
  private idempotencyMap = new Map<string, any>();

  async execute<T>(operationId: string, operation: () => Promise<T>): Promise<T> {
    // Return cached result if already executed
    if (this.idempotencyMap.has(operationId)) {
      const cached = this.idempotencyMap.get(operationId);
      if (cached.error) {
        throw cached.error;
      }
      console.info('[Idempotent] Returning cached result', { operationId });
      return cached.result;
    }

    try {
      const result = await operation();
      this.idempotencyMap.set(operationId, { result, error: null });
      return result;
    } catch (error) {
      this.idempotencyMap.set(operationId, { result: null, error });
      throw error;
    }
  }

  clear(operationId: string) {
    this.idempotencyMap.delete(operationId);
  }

  clearAll() {
    this.idempotencyMap.clear();
  }
}
