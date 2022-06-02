import {
  Chat
} from "../models/chat";
import {
  Customers
} from "../models/customers";
import {
  database
} from "../models/firebase/firebase";
import {
  Suppliers
} from "../models/suppliers";
import {
  SystemProfile
} from "../models/systemprofile";
import dbEntity from "../services/dbEntity";

class ChatController {
  public run = async () => {
    try {
      return database.ref("chat-message").on("value", async (snapshot) => {
        // console.log(snapshot.val());
        if (snapshot.val()) {
          await Chat.query().insert({
            ...snapshot.val(),
            status: "unread"
          });
          let [chatmessagesTo, chatmessagesFrom] = await Promise.all([
            Chat.query()
            .select(...dbEntity.chatEntity)
            .where("to", snapshot.val().to)
            .andWhere("from", snapshot.val().from),
            Chat.query()
            .select(...dbEntity.chatEntity)
            .where("from", snapshot.val().to)
            .andWhere("to", snapshot.val().from),
          ]);
          chatmessagesTo.push(...chatmessagesFrom);
          chatmessagesTo = chatmessagesTo.sort(
            (a: any, b: any) => a.createdat - b.createdat
          );

          const fromInfo =
            (await Customers.query()
              .select(
                "accountId as id",
                "firstName as firstname",
                "lastName as lastname",
                "avt as avt"
              )
              .where("accountId", snapshot.val().from)
              // .andWhere("isDeleted", false)
              .first()) ||
            (await Suppliers.query()
              .select("accountId as id", "name as name", " avt as avt")
              .where("accountId", snapshot.val().from)
              // .andWhere("isDeleted", false)
              .first()) ||
            (await SystemProfile.query()
              .select("accountId as id", "name as name", " avt as avt")
              .where("accountId", snapshot.val().from)
              // .andWhere("isDeleted", false)
              .first());

          const toInfo =
            (await Customers.query()
              .select(
                "accountId as id",
                "firstName as firstname",
                "lastName as lastname",
                "avt as avt"
              )
              .where("accountId", snapshot.val().to)
              // .andWhere("isDeleted", false)
              .first()) ||
            (await Suppliers.query()
              .select("accountId as id", "name as name", " avt as avt")
              .where("accountId", snapshot.val().to)
              // .andWhere("isDeleted", false)
              .first()) ||
            (await SystemProfile.query()
              .select("accountId as id", "name as name", " avt as avt")
              .where("accountId", snapshot.val().to)
              // .andWhere("isDeleted", false)
              .first());

          await database
            .ref("message/" + snapshot.val().from + "/" + snapshot.val().to)
            .set({
              data: chatmessagesTo,
              userinfo: toInfo,
            });
          await database
            .ref("message/" + snapshot.val().to + "/" + snapshot.val().from)
            .set({
              data: chatmessagesTo,
              userinfo: fromInfo
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getChatMessageByCustomer = async (req: any, res: any, next: any) => {
    try {
      const customerId = req.user.accountid;
      // console.log(req.user)

      const chatData = await Chat.query()
        .select(...dbEntity.chatEntity)
        .where("from", customerId)
        .orWhere("to", customerId);

      return res.status(200).send({
        message: "successful",
        data: chatData,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: error
      });
    }
  };

  public getChatMessageBySenderOrReceiver = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      // const from = req.user.accountid;
      const from = req.body.from;
      const to = req.body.to;

      const data = await Chat.query()
        .select(...dbEntity.chatEntity)
        .where("from", from)
        .andWhere("to", to);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: error
      });
    }
  };

  public updateChatMessageToRead = async (req: any, res: any, next: any) => {
    try {
      const from = req.body.from;
      const to = req.body.to;
      const status = "read";

      const data = await Chat.query()
        .update({
          status: status,
        })
        .where("from", from)
        .andWhere("to", to);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: error
      });
    }
  };

  public getChatAllowTime = async (req: any, res: any, next: any) => {
    try {
      // const from = req.user.accountid;
      const {
        from,
        to,
        startDate,
        endDate
      } = req.body;
      // const from = req.body.from;
      // const to = req.body.to;

      const data = await Chat.query()
        .select(...dbEntity.chatEntity)
        .where((cd) => {
          cd.where((cd1) => {
            cd1.where("from", from).andWhere("to", to);
          }).orWhere((cd2) => {
            cd2.where("to", from).andWhere("from", to);
          });
        })
        .andWhere((cd) => {
          if (startDate && endDate) {
            cd.whereBetween("createdAt", [startDate, endDate]);
          }
          if (startDate && !endDate) {
            cd.where("createdAt", ">=", startDate);
          }

          if (!startDate && endDate) {
            cd.where("createdAt", "<=", endDate);
          }
        });

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: error
      });
    }
  };
}

export default new ChatController();