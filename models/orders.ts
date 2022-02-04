import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Order extends Model {
  static get tableName() {
    return "orders";
  }

  id?: string;
  customerid?: string;
  iswholesale?: boolean;
  customerdiscountcodeid?: string;
  status?: string;
  campaignid?: string;
  paymentid?: string;
  discountprice?: number;
  shippingfee?: number;
  ordercode?: string;
  createdat?: Date;
  updatedat?: Date;
  addressid?: string;
  totalprice?: number;
  supplierid?: string;
  address?: string;
}
