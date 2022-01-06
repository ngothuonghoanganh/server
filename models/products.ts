import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Products extends Model {
    static get tableName() {
        return "products";
    }

    id?: string;
    name?: string;
    supplierid?: string;
    retailprice?: Number;
    quantity?: Number;
    description?: string;
    image?: string;
    categoryid?: string;
    status?: string;
    typeofproduct?: string;
    createdat?: Date;
    updatedat?: Date;
}