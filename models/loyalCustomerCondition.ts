import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomerCondition extends Model {
  static get tableName() {
    return "loyalcustomercondition";
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
        }
    },
    format(object: any) {
        return {
          id: object.id,
          supplierId: object.supplierid,
          minOrder: object.minorder,
          minProduct: object.minproduct,
          discountPercent: object.discountpercent,
          createdAt: object.createdat,
        }
    },
}
}