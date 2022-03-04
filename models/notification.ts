import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Notification extends Model {
  static get tableName() {
    return "notif";
  }
  id?: string;
  userid?:string;
  link?:string;
  message?: string;
  status?: string;
  created?: Date;

}