import { CronJob } from 'cron';
import { logger } from '../utils/logger.js';

export class Scheduler {
  constructor() {
    this.jobs = [];
  }

  every(cronExpr, fn) {
    const job = new CronJob(
      cronExpr,
      async () => {
        try {
          await fn();
        } catch (err) {
          logger.error({ err }, 'Scheduled job error');
        }
      },
      null,
      true
    );
    this.jobs.push(job);
    return job;
  }

  stopAll() {
    for (const j of this.jobs) j.stop();
    this.jobs = [];
  }
}
