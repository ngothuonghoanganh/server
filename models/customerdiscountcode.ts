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
  quantity?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        customerid: object.customerId,
        discountiodeid: object.discountCodeId,
        quantity: object.quantity,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        status: object.status,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        customerId: object.customerId,
        discountCodeId: object.discountCodeId,
        quantity: object.quantity,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        status: object.status,
      };
    },
  };
}
