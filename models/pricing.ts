import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Pricing extends Model {
    static get tableName() {
        return "pricing";
    }

    id?: string;
    platformFeePercent?: Number;
    paymentFeePercent?: Number;
    createdAt?: Date;
    updatedAt?: Date;
    status?: string;

}