import { Model, ModelObject } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);
export class Role extends Model {
  static get tableName() {
    return "roles";
  }
  id?: string;
  roleName?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        rolename: object.roleName,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        roleName: object.roleName,
      };
    },
  };
}
