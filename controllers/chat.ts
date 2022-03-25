import { Chat } from "../models/chat";
import { database } from "../models/firebase/firebase";

class ChatController {
  public run = async () => {
    try {
      return database.ref("chat-message").on("value", async (snapshot) => {
        // console.log(snapshot.val());
        if (snapshot.val()) {
          await Chat.query().insert({ ...snapshot.val(), status: "unread" });
          let [chatmessagesTo, chatmessagesFrom] = await Promise.all([
            Chat.query()
              .select()
              .where("to", snapshot.val().to)
              .andWhere("from", snapshot.val().from),
            Chat.query()
              .select()
              .where("from", snapshot.val().to)
              .andWhere("to", snapshot.val().from),
          ]);
          chatmessagesTo.push(...chatmessagesFrom);
          chatmessagesTo = chatmessagesTo.sort(
            (a: any, b: any) => a.createdat - b.createdat
          );
          await database
            .ref("message/" + snapshot.val().from + "/" + snapshot.val().to)
            .set(chatmessagesTo);
          await database
            .ref("message/" + snapshot.val().to + "/" + snapshot.val().from)
            .set({ ...chatmessagesTo });
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
        .select()
        .where("from", customerId)
        .orWhere("to", customerId);

      return res.status(200).send({
        message: "successful",
        data: chatData,
      });
    } catch (error) {
      console.log(error);
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
        .select()
        .where("from", from)
        .andWhere("to", to);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
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
    }
  };
}

export default new ChatController();
