import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Transaction extends Model {
    static get tableName() {
        return "transaction";
    }

    id?: string;
    supplierid?: string;
    amount?: Number;
    ordercode?: string;
    advancefee?: Number;
    ordervalue?: Number;
    paymentvalue?: Number;
    platformfee?: Number;
    Penaltyfee?: Number;
    type?: string;
    iswithdrawable?: boolean;
    description?: string;
    content?: string;
    status?: string;
    createdat?: Date;
    updatedat?: Date;
}