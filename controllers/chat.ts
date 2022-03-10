import { Chat } from "../models/chat";
import { database } from "../models/firebase/firebase";

class ChatController {
  public run = async () => {
    try {
      return database.ref("chat-message").on("value", async (snapshot) => {
        console.log(snapshot.val());
        if (snapshot.val()) {
          await Chat.query().insert({ ...snapshot.val(), status: "unread" });
          const chatmessages = await Chat.query()
            .select()
            .where("to", snapshot.val().to);
          // console.log(chatmessages);

          const result = chatmessages.reduce((r, a: any) => {
            r[a.from] = r[a.from] || [];
            r[a.from].push(a);
            return r;
          }, Object.create({}));
          await database.ref("message/" + snapshot.val().to).set(result);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new ChatController();
