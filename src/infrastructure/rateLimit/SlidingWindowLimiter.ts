const SWEEP_THRESHOLD = 1000;

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  hit(key: string): boolean {
    const current = this.now();
    if (this.hits.size > SWEEP_THRESHOLD) {
      this.sweep(current);
    }
    const recent = this.recentOf(key, current);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    this.hits.set(key, [...recent, current]);
    return true;
  }

  private recentOf(key: string, current: number): number[] {
    return (this.hits.get(key) ?? []).filter((timestamp) => current - timestamp < this.windowMs);
  }

  private sweep(current: number): void {
    for (const key of this.hits.keys()) {
      const recent = this.recentOf(key, current);
      if (recent.length === 0) {
        this.hits.delete(key);
      }
    }
  }
}
