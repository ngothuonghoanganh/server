import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Transaction extends Model {
  static get tableName() {
    return "transactions";
  }

  id?: string;
  supplierId?: string;
  amount?: Number;
  orderCode?: string;
  advanceFee?: Number; 
  orderValue?: Number; //
  paymentFee?: Number; // 2% of order
  platformFee?: Number; // 2% of order
  penaltyFee?: Number; // 20% order
  type?: string;
  isWithdrawable?: boolean;
  description?: string;
  content?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentLink?: string;
}
