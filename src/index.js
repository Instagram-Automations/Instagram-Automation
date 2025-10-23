import { config } from 'dotenv';
config();

import { logger } from './utils/logger.js';
import { loadSettings } from './utils/settings.js';
import { Scheduler } from './scheduler/scheduler.js';
import { AutomationEngine } from './engine/engine.js';
import { InstagramClient } from './services/instagramClient.js';
import { RateLimiter } from './utils/rateLimiter.js';
import { delay } from './utils/time.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function loadTargets() {
  const p = path.join(__dirname, 'data', 'targets.json');
  const raw = await fs.readFile(p, 'utf-8');
  return JSON.parse(raw);
}

async function main() {
  const settings = loadSettings();
  logger.info({ settings }, 'Starting Instagram Automation');

  const client = new InstagramClient({
    mock: settings.MOCK_MODE,
    headless: settings.HEADLESS,
    proxyUrl: settings.PROXY_URL
  });

  const limiter = new RateLimiter({
    windowMs: 60_000,
    maxTokens: 30,
    refillEveryMs: 2_000,
    refillAmount: 1
  });

  const engine = new AutomationEngine({ client, limiter });

  const targets = await loadTargets();

  // Immediate demo run
  await engine.runCampaign({
    name: 'demo-seed',
    actions: [
      { type: 'like', targetType: 'hashtag', value: 'javascript', count: 3 },
      { type: 'follow', targetType: 'user', value: targets.users[0], count: 1 },
      { type: 'dm', targetType: 'user', value: targets.users[1], message: 'Hey! Loved your recent post 🤖', count: 1 }
    ]
  });

  // Schedule recurring tasks (every 10 minutes demo)
  const scheduler = new Scheduler();
  scheduler.every('*/10 * * * *', async () => {
    logger.info('Scheduled job triggered');
    await engine.runCampaign({
      name: 'scheduled-engagement',
      actions: [
        { type: 'like', targetType: 'hashtag', value: 'coding', count: 2 },
        { type: 'story-view', targetType: 'user', value: targets.users[2], count: 3 }
      ]
    });
  });

  logger.info('Automation is running. Press Ctrl+C to exit.');
  // Keep process alive
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await delay(60_000);
  }
}

main().catch((err) => {
  logger.error({ err }, 'Fatal error');
  process.exit(1);
});
