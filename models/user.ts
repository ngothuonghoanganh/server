import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class User extends Model {
  static get tableName() {
    return "user";
  }
  Id?: string;
  UserName?: string;
  Password?: string;
  GoogleId?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  RoleId?: number;
  Avt?: string;
  IsDeleted?: boolean;
  CreateDate?: Date;
}
