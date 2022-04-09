import { ColumnNameMappers, Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Accounts extends Model {
    static get tableName() {
        return "accounts";
    }

    id?: string;
    phone?: string;
    roleId?: string;
    username?: string;
    password?: string;
    googleId?: string;
    isDeleted?: Boolean;
    reasonForDisabling?: string;
    reasonForEnabling?: string;

    static columnNameMappers: any = {
        parse(object: any) {
            return {
                id: object.id,
                phone: object.phone,
                roleid: object.roleId,
                username: object.username,
                password: object.password,
                googleid: object.googleId,
                isdeleted: object.isDeleted,
                reasonfordisabling: object.reasonForDisabling,
                reasonforenabling: object.reasonForEnabling,

            }
        },
        format(object: any) {
            return {
                id: object.id,
                roleId: object.roleid,
                phone: object.phone,
                username: object.userName,
                password: object.password,
                googleId: object.googleid,
                isDeleted: object.isdeleted,
                reasonForDisabling: object.reasonfordisabling,
                reasonForEnabling: object.reasonforenabling,
            }
        },
    }

}