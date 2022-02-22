import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Campaigns extends Model {
  static get tableName() {
    return "campaigns";
  }

  id?: string;
  supplierid?: string;
  productid?: string;
  code?: string;
  fromdate?: Date;
  todate?: Date;
  quantity?: number;
  price?: number;
  status?: string;
  createdat?: Date;
  updatedat?: Date;
  reasonforupdatestatus?: string;
  maxquantity?: number;
  isshare?: boolean;
}
