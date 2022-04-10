import { ColumnNameMappers, Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Chat extends Model {
  static get tableName() {
    return "chatMessages";
  }

  id?: string;
  from?: string;
  to?: string;
  message?: string;
  file?: string;
  status?: string;
  createdAt?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        from: object.from,
        to: object.to,
        message: object.message,
        file: object.file,
        status: object.status,
        createdat: object.createdAt,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        from: object.from,
        to: object.to,
        message: object.message,
        file: object.file,
        status: object.status,
        createdAt: object.createdAt,
      };
    },
  };
}
