export class RateLimiter {
  private lastRequestTime: number = 0;
  private queue: Promise<void> = Promise.resolve();

  constructor(private minInterval: number) {}

  async acquire(): Promise<void> {
    this.queue = this.queue.then(() => this.delay());
    await this.queue;
  }

  private async delay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }
}