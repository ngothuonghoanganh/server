import { Model } from "objection";
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
    createdAt?: Date;
    updatedAt?: Date;
}