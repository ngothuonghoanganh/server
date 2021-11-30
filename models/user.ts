import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class User extends Model {
  static get tableName() {
    return "user";
  }
  Id?: number;
  UserName?: string;
  Password?: string;
  FacebookId?: string;
  GoogleId?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  Reputation?: number;
  RoleId?: number;
  Avt?: string;
  IsDeleted?: boolean;
  CreateDate?: Date;
}
