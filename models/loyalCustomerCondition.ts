import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomerCondition extends Model {
  static get tableName() {
    return "loyalCustomerConditions";
  }
  id?: string;
  supplierId?: string;
  minOrder?: number;
  minProduct?: string;
  discountPercent?: number;
  createdAt?: Date;
  updatedAt?: Date;
}