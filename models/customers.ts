import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Customers extends Model {
  static get tableName() {
    return "customers";
  }

  id?: string;
  accountid?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  avt?: string;
  isdeleted?: boolean;
  eWalletCode?:string;
  eWalletSecret?:string;
  createdat?: Date;
  updatedat?: Date;
}
