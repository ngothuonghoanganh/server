import { Customers } from "../../models/customers";
import { database } from "../../models/firebase/firebase";
import { Notification } from "../../models/notification";
import { Suppliers } from "../../models/suppliers";

class Notif {
  //send noti gom 3 thanh phan
  //userid
  //message
  //link
  public sendNotiForWeb = async (data: any) => {
    database.ref("notif/" + data.userid).set(data);
    //insert data of noti to database
    const insertNoti = await Notification.query().insert({
      userId: data.userid,
      link: data.link,
      message: data.message,
      status: "unread",
    });
    // console.log(insertNoti)
  };

  public getNotifByAccountId = async (req: any, res: any, next: any) => {
    try {
      const accountId = req.query.accountId;

      const data = await Notification.query()
        .select()
        .where("userid", accountId);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getNotiForLoginUser = async (req: any, res: any) => {
    try {
      const accountId = req.user.accountid;

      const data = await Notification.query()
        .select()
        .where("userId", accountId);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateNotifByListId = async (req: any, res: any) => {
    try {
      const notifs = req.body.notifs;

      const data = await Notification.query()
        .update({
          status: "read",
        })
        .whereIn("id", notifs);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new Notif();
