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
    image?: string;
    categoryId?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;

    static columnNameMappers: any = {
        parse(object: any) {
          return {
            id: object.id,
            name: object.name,
            retailprice: object.retailPrice,
            quantity: object.quantity,
            image: object.image,
            categoryid: object.categoryId,
            status: object.status,
            createdat: object.createdAt,
            updatedat: object.updatedAt,
          }
        },
        format(object: any) {
          return {
            id: object.id,
            name: object.name,
            retailPrice: object.retailprice,
            quantity: object.quantity,
            image: object.image,
            categoryId: object.categoryid,
            status: object.status,
            createdAt: object.createdat,
            updatedAt: object.updatedat,
          }
        },
      }
}