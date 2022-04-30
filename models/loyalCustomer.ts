import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomer extends Model {
  static get tableName() {
    return "loyalcustomer";
  }
  id?: string;
  supplierId?: string;
  customerId?: string;
  numOfOrder?: number;
  numOfProduct?: string;
  discountPercent?: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
}
