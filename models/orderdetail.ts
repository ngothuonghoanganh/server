import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderDetail extends Model {
  static get tableName() {
    return "orderdetail";
  }

  id?: string;
  productid?: string;
  productname?: string;
  quantity?: number;
  price?: number;
  totalprice?: number;
  notes?: string;
  typeofproduct?: string;
  ordercode?: string;
  orderid?: string;
  image?: string;
  customerid?: string;
  incampaign?: boolean;
  campaignid?: string;
  comment?: string;
  rating?: Number;
}
