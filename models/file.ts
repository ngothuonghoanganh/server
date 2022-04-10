import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Files extends Model {
  static get tableName() {
    return "files";
  }
  id?: string;
  name?: string;
  url?: string;
  isdeleted?: boolean;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        name: object.name,
        url: object.url,
        isdeleted: object.isDeleted,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        name: object.name,
        url: object.url,
        isDeleted: object.isDeleted,
      };
    },
  };
}
