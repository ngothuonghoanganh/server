import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Users extends Model {
  static get tableName() {
    return "users";
  }
  id?: string;
  username?: string;
  password?: string;
  googleid?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  roleid?: number;
  avt?: string;
  isdeleted?: boolean;
  createdat?: Date;
}
