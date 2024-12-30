export class RequestQueue {
  private queue: Promise<any> = Promise.resolve();
  private activeRequests = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;
    try {
      const result = await task();
      return result;
    } finally {
      this.activeRequests--;
    }
  }
}