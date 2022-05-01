import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CustomerDiscountCode extends Model {
    static get tableName() {
        return "customerDiscountCodes";
    }

    id?: string;
    customerId?: string;
    discountCodeId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: string;
}