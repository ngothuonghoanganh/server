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
  productid?: string;
  productname?: string;
  quantity?: number;
  iswholesale?: boolean;
  price?: number;
  typeofproduct?: string;
  customerdiscountid?: string;
  status?: string;
  campaignid?: string;
  paymentid?: string;
  discountprice?: number;
  notes?: string;
  shippingfee?: number;
  ordercode?: string;
  createdat?: Date;
  updatedat?: Date;
  addressid?: string;
  totalprice?: number;
}
