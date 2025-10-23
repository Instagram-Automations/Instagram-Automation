import { logger } from '../utils/logger.js';
import { humanDelay } from '../utils/time.js';

export class AutomationEngine {
  constructor({ client, limiter }) {
    this.client = client;
    this.limiter = limiter;
    this.inited = false;
  }

  async ensureInit() {
    if (!this.inited) {
      await this.client.init();
      const needLogin = !this.client.mock && process.env.IG_USERNAME && process.env.IG_PASSWORD;
      if (needLogin) {
        await this.client.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
      }
      this.inited = true;
    }
  }

  async runCampaign({ name, actions }) {
    await this.ensureInit();
    logger.info({ name, steps: actions.length }, 'Running campaign');

    for (const step of actions) {
      await this.limiter.removeToken();
      await this.execute(step);
      await humanDelay(1200, 3000);
    }

    logger.info({ name }, 'Campaign complete');
  }

  async execute(step) {
    const { type, targetType, value, count = 1, message } = step;
    logger.debug({ step }, 'Executing step');
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'like':
          if (targetType === 'hashtag') await this.client.likeHashtag(value);
          break;
        case 'follow':
          if (targetType === 'user') await this.client.followUser(value);
          break;
        case 'dm':
          if (targetType === 'user') await this.client.sendDM(value, message || '');
          break;
        case 'story-view':
          if (targetType === 'user') await this.client.viewStory(value);
          break;
        default:
          logger.warn({ type }, 'Unknown action type');
      }
    }
  }
}
