import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class DiscountCode extends Model {
  static get tableName() {
    return "discountCodes";
  }

  id?: string;
  supplierId?: string;
  code?: string;
  description?: string;
  minimunPriceCondition?: Number;
  startDate?: Date;
  endDate?: Date;
  quantity?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  discountPrice?: Number;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        supplierid: object.supplierId,
        code: object.code,
        description: object.description,
        minimunpricecondition: object.minimunPriceCondition,
        startdate: object.startDate,
        enddate: object.endDate,
        quantity: object.quantity,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        status: object.status,
        discountprice: object.discountPrice,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        supplierId: object.supplierId,
        code: object.code,
        description: object.description,
        minimunPriceCondition: object.minimunPriceCondition,
        startDate: object.startDate,
        endDate: object.endDate,
        quantity: object.quantity,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        status: object.status,
        discountPrice: object.discountPrice,
      };
    },
  };
}
