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
  minimumPriceCondition?: Number;
  // startDate?: Date;
  endDate?: Date;
  quantity?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  discountPrice?: Number;

}