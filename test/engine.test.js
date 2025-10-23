import { test, strict as assert } from 'node:test';
import { AutomationEngine } from '../src/engine/engine.js';
import { RateLimiter } from '../src/utils/rateLimiter.js';

class MockClient {
  constructor() { this.calls = []; this.mock = true; }
  async init() {}
  async likeHashtag(tag) { this.calls.push(['like', tag]); }
  async followUser(u) { this.calls.push(['follow', u]); }
  async sendDM(u, m) { this.calls.push(['dm', u, m]); }
  async viewStory(u) { this.calls.push(['story', u]); }
}

test('engine executes actions in order', async () => {
  const client = new MockClient();
  const limiter = new RateLimiter({ windowMs: 1000, maxTokens: 100, refillEveryMs: 50, refillAmount: 1 });
  const engine = new AutomationEngine({ client, limiter });

  await engine.runCampaign({
    name: 'unit',
    actions: [
      { type: 'like', targetType: 'hashtag', value: 'coding', count: 1 },
      { type: 'follow', targetType: 'user', value: 'foo', count: 1 },
      { type: 'dm', targetType: 'user', value: 'bar', message: 'hi', count: 1 },
      { type: 'story-view', targetType: 'user', value: 'baz', count: 1 }
    ]
  });

  assert.equal(client.calls.length, 4);
  assert.deepEqual(client.calls[0], ['like', 'coding']);
  assert.deepEqual(client.calls[1], ['follow', 'foo']);
  assert.deepEqual(client.calls[2], ['dm', 'bar', 'hi']);
  assert.deepEqual(client.calls[3], ['story', 'baz']);
});
