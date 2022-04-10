import { Model } from "objection";
import * as connection from "./db/connection";
import { Products } from "./products";

Model.knex(connection.knex);

export class Categories extends Model {
  static get tableName() {
    return "categories";
  }

  id?: string;
  categoryName?: string;
  supplierId?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        categoryname: object.categoryName,
        supplierid: object.supplierId,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        isdeleted: object.isDeleted,
        ...object
      };
    },
    format(object: any) {
      return {
        id: object.id,
        categoryName: object.categoryName,
        supplierId: object.supplierId,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        isDeleted: object.isDeleted,
      };
    },
  };
}
