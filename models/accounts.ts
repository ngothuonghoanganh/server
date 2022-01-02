import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Accounts extends Model {
    static get tableName() {
        return "accounts";
    }

    id?: string;
    phone?: string;
    roleid?: string;
    username?: string;
    password?: string;
    googleid?: string

}