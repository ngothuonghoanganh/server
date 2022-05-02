import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Products extends Model {
    static get tableName() {
        return "products";
    }

    id?: string;
    name?: string;
    retailPrice?: Number;
    quantity?: Number;
    description?: string;
    image?: string;
    categoryId?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}