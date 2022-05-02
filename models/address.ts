import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Address extends Model {
    static get tableName() {
        return "addresses";
    }

    id?: string;
    customerId?: string;
    province?: string;
    street?: string;
    isDefault?:boolean;
    createdAt?: Date;
    updatedAt?: Date;

}