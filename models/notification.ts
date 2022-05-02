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
  updatedAt?: Date;

}