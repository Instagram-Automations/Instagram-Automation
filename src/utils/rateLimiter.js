/**
 * Simple token bucket rate limiter.
 */
export class RateLimiter {
  constructor({ windowMs, maxTokens, refillEveryMs, refillAmount }) {
    this.windowMs = windowMs;
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillEveryMs = refillEveryMs;
    this.refillAmount = refillAmount;
    this._interval = setInterval(() => this._refill(), this.refillEveryMs).unref();
  }

  _refill() {
    this.tokens = Math.min(this.maxTokens, this.tokens + this.refillAmount);
  }

  async removeToken() {
    while (this.tokens <= 0) {
      await new Promise((r) => setTimeout(r, 100));
    }
    this.tokens -= 1;
  }
}
