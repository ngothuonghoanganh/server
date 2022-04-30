import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Customers extends Model {
  static get tableName() {
    return "customers";
  }

  id?: string;
  accountId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avt?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  eWalletCode?:string;
  eWalletSecret?:string;
  
}
