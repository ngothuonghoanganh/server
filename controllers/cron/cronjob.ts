import cron from "cron";
import { Campaigns } from "../../models/campaigns";

// import hello from "./job/helloword";
class cronJob {
  cronjob = new cron.CronJob("* * * * * *", () => {
    try {
      // hello.Hello();
    } catch (e) {
      console.error(e);
    }
  });

  getAllCampaign =  new cron.CronJob('* * * * * *', async () => {
    try {
      // get all campaign id with conditions below (todate < today and status is active)
        // await Campaigns.query()
        // .update({
        //   status: 'done',
        // })
        // .where("todate", "<", Campaigns.raw("now()"))
        // .andWhere("status",  "active")

    } catch (error) {
      console.log(error)
    }
  });

  public run = () => {
    // this.getAllCampaign.start();

  };

}

export default new cronJob();
