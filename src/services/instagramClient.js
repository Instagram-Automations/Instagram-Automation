import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';
import { humanDelay } from '../utils/time.js';
import { getLaunchArgs } from '../utils/proxy.js';

/**
 * InstagramClient provides two modes:
 *  - mock: logs actions without real browser
 *  - real: uses Playwright to open Instagram and simulate navigation
 */
export class InstagramClient {
  constructor({ mock = true, headless = true, proxyUrl = '' } = {}) {
    this.mock = mock;
    this.headless = headless;
    this.proxyUrl = proxyUrl;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    if (this.mock) {
      logger.info('InstagramClient running in MOCK mode.');
      return;
    }
    const args = getLaunchArgs(this.proxyUrl);
    this.browser = await chromium.launch({ headless: this.headless, args });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    logger.info({ headless: this.headless, args }, 'Browser launched');
  }

  async login(username, password) {
    if (this.mock) {
      logger.info({ username }, '[MOCK] login');
      return;
    }
    logger.info('Navigating to Instagram login page');
    await this.page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1500);
    // Basic form interaction (selectors may change)
    await this.page.fill('input[name=username]', username);
    await this.page.fill('input[name=password]', password);
    await this.page.click('button[type=submit]');
    await this.page.waitForLoadState('networkidle');
    logger.info('Login attempted');
  }

  async likeHashtag(hashtag) {
    if (this.mock) {
      logger.info({ hashtag }, '[MOCK] like hashtag');
      await humanDelay();
      return true;
    }
    await this.page.goto(`https://www.instagram.com/explore/tags/${encodeURIComponent(hashtag)}/`, { waitUntil: 'domcontentloaded' });
    await humanDelay();
    // This is intentionally light-touch to avoid brittle selectors
    logger.info({ hashtag }, 'Visited hashtag page (real mode)');
    return true;
  }

  async followUser(username) {
    if (this.mock) {
      logger.info({ username }, '[MOCK] follow user');
      await humanDelay();
      return true;
    }
    await this.page.goto(`https://www.instagram.com/${encodeURIComponent(username)}/`, { waitUntil: 'domcontentloaded' });
    logger.info({ username }, 'Visited profile (real mode)');
    return true;
  }

  async sendDM(username, message) {
    if (this.mock) {
      logger.info({ username, message }, '[MOCK] send DM');
      await humanDelay();
      return true;
    }
    // Real DM requires authenticated flows; we only demonstrate navigation here
    await this.page.goto(`https://www.instagram.com/direct/new/`, { waitUntil: 'domcontentloaded' });
    logger.info({ username }, 'Opened new message (real mode)');
    return true;
  }

  async viewStory(username) {
    if (this.mock) {
      logger.info({ username }, '[MOCK] view story');
      await humanDelay();
      return true;
    }
    await this.page.goto(`https://www.instagram.com/${encodeURIComponent(username)}/`, { waitUntil: 'domcontentloaded' });
    logger.info({ username }, 'Visited story container (real mode)');
    return true;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
}
