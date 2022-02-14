import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CustomerDiscountCode extends Model {
    static get tableName() {
        return "customerdiscountcode";
    }

    id?: string;
    customerid?: string;
    discountcodeid?: string;
    quantity?: Number;
    createdat?: Date;
    updatedat?: Date;
    status?: string;
}