import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class DiscountCode extends Model {
  static get tableName() {
    return "discountcode";
  }

  id?: string;
  supplierid?: string;
  code?: string;
  description?: string;
  minimunpricecondition?: Number;
  percent?: Number;
  startdate?: Date;
  enddate?: Date;
  quantity?: Number;
  createdat?: Date;
  updatedat?: Date;
  status?: string;
  productid?: string;
  discountprice?: Number;

}