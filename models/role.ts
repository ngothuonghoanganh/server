import { Model, ModelObject } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);
export class Role extends Model {
  static get tableName() {
    return "roles";
  }
  id?: string;
  roleName?: string;
  
}
