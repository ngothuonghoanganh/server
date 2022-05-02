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
  isDeleted?: boolean;
}
