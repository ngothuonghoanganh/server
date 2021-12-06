import { Model, ModelObject } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);
export class Role extends Model {
  static get tableName() {
    return "role";
  }
  id?: string;
  rolename!: string;
  description?: string;
  isdeleted?: boolean;
  createdat?: Date;
}
