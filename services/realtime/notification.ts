import { database } from "../../models/firebase/firebase";
import {Notification} from "../../models/notification";

class Notif {
    //send noti gom 3 thanh phan 
    //userid
    //message
    //link
    public sendNotiForWeb = async (data: any) => {
        database.ref('notif/' + data.userid).set(data)
        //insert data of noti to database
        const insertNoti = await Notification.query()
            .insert({
                userid: data.userId,
                link: data.link,
                message: data.message,
                status: "unseen",
            })
        
    }
}

export default new Notif;
