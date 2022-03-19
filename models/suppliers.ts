import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Suppliers extends Model {
  static get tableName() {
    return "suppliers";
  }
  id?: string;
  accountid?: string;
  name?: string;
  email?: string;
  address?: string;
  avt?: string;
  isdeleted?: boolean;
  createdat?: Date;
  updatedat?: Date;
  identificationcard?: string;
  identificationimage?: string;
  ewalletcode?: string;
  ewalletsecrect?: string;

}
