import cron from "cron";
import hello from "./job/helloword";
class cronJob {
  cronjob = new cron.CronJob("* * * * * *", () => {
    try {
      // hello.Hello();
    } catch (e) {
      console.error(e);
    }
  });

  public run = () => {
    return this.cronjob.start();
  };
}

export default new cronJob();
