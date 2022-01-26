import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Address extends Model {
    static get tableName() {
        return "address";
    }

    id?: string;
    customerid?: string;
    province?: string;
    street?: string;
    isdefault?:boolean;
    createdat?: Date;
    updatedat?: Date;

}