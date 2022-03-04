import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomerCondition extends Model {
  static get tableName() {
    return "loyalcustomercondition";
  }
  id?: string;
  supplierid?:string;
 minorder?: number;
 minproduct?: string;
 discountpercent?: number;
  created?: Date;

}