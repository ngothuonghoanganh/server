import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class SystemProfile extends Model {
  static get tableName() {
    return "systemprofile";
  }

  id?: string;
  accountid?: string;
  name?: string;
  avt?: string;
  isdeleted?: boolean;
  createdat?: Date;
  updatedat?: Date;
}
