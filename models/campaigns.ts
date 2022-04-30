import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Campaigns extends Model {
  static get tableName() {
    return "campaigns";
  }

  id?: string;
  productId?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  quantity?: number;
  price?: number;
  createdAt?: Date;
  updatedAt?: Date;
  code?: string;
  description?: string;
  maxQuantity?: number;
  isShare?: boolean;
  advanceFee?: number;
  productName?: string;
  image?: string;
  range?: string;

}
