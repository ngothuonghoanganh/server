import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderDetail extends Model {
  static get tableName() {
    return "orderDetails";
  }

  id?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  note?: string;
  orderCode?: string;
  productId?: string;
  totalPrice?: number;
  image?: string;
  orderId?: string;
  comment?: string;
  rating?: Number;
  createdAt?: Date;
  updatedAt?: Date;
}
