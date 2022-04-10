import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Notification extends Model {
  static get tableName() {
    return "notifications";
  }
  id?: string;
  userId?: string;
  link?: string;
  message?: string;
  status?: string;
  createdAt?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        userid: object.userId,
        link: object.link,
        message: object.message,
        status: object.status,
        createdat: object.createdAt,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        userId: object.userId,
        link: object.link,
        message: object.message,
        status: object.status,
        createdAt: object.createdAt,
      };
    },
  };
}
