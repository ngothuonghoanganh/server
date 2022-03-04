import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomer extends Model {
  static get tableName() {
    return "loyalcustomer";
  }
  id?: string;
  supplierid?: string;
  customerid?: string;
  numoforder?: number;
  numofproduct?: string;
  discountpercent?: number;
  created?: Date;
  status?: string;
}
