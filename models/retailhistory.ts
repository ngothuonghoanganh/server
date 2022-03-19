import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class RetailHistory extends Model {
    static get tableName() {
        return "retailhistory";
    }

    id?: string;
    orderretailid?: string;
    ordercode?: string;
    statushistory?: string;
    images?:boolean;
    description?: string;
    createdat?: Date;
    updatedat?: Date;

}