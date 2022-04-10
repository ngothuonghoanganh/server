import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomerCondition extends Model {
  static get tableName() {
    return "loyalCustomerConditions";
  }
  id?: string;
  supplierId?: string;
  minOrder?: number;
  minProduct?: string;
  discountPercent?: number;
  createdAt?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        supplierid: object.supplierId,
        minorder: object.minOrder,
        minproduct: object.minProduct,
        discountpercent: object.discountPercent,
        createdat: object.createdAt,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        supplierId: object.supplierId,
        minOrder: object.minOrder,
        minProduct: object.minProduct,
        discountPercent: object.discountPercent,
        createdAt: object.createdAt,
      };
    },
  };
}
