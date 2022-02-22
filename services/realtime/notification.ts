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
        let userId = "e27d569a-e786-4a1f-a5fc-97ff7a9c61fe"
        let link = 'abc123'
        let message = 'hello'
        let status = 'read'
        const insertNoti = await Notification.query()
            .insert({
                userid: userId,
                link: link,
                message: message,
                status: status,
            })
        
    }
}

export default new Notif;
