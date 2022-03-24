import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderStatusHistory extends Model {
    static get tableName() {
        return "orderstatushistory";
    }

    id?: string;
    orderid?: string;
    ordercode?: string;
    statushistory?: string;
    image?:string;
    description?: string;
    createdat?: Date;
    updatedat?: Date;
    type?: string;

}