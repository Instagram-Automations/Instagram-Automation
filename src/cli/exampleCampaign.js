#!/usr/bin/env node
import { config } from 'dotenv';
config();

import { InstagramClient } from '../services/instagramClient.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { AutomationEngine } from '../engine/engine.js';

const client = new InstagramClient({
  mock: true,
  headless: true
});

const limiter = new RateLimiter({
  windowMs: 60_000,
  maxTokens: 20,
  refillEveryMs: 1_500,
  refillAmount: 1
});

const engine = new AutomationEngine({ client, limiter });

await engine.runCampaign({
  name: 'cli-demo',
  actions: [
    { type: 'like', targetType: 'hashtag', value: 'webdev', count: 2 },
    { type: 'follow', targetType: 'user', value: 'thecodinglove', count: 1 }
  ]
});

