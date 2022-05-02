import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Order extends Model {
  static get tableName() {
    return "orders";
  }

  id?: string;
  status?: string;
  address?: string;
  paymentMethod?: string;
  customerId?: string;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  discountPrice?: number;
  shippingFee?: number;
  orderCode?: string;
  totalPrice?: number;
  customerDiscountCodeId?: string;
  loyalCustomerDiscountPercent?: number;
}
