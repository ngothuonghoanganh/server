import { database } from "../../models/firebase/firebase";


class Notif {
    //send noti gom 3 thanh phan 
    //userid
    //message
    //link
    public sendNotiForWeb = async (data: any) => {
        database.ref('notif/' + data.userid).set(data)
        //insert data of noti to database
    }
}

export default new Notif;
