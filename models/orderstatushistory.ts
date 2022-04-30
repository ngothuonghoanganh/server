import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderStatusHistory extends Model {
  static get tableName() {
    return "orderstatushistory";
  }

  id?: string;
  campaignOrderId?: string;
  orderCode?: string;
  orderStatus?: string;
  image?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  retailOrderId?: string;
  type?: string;  
}
