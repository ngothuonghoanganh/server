import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class File extends Model {
  static get tableName() {
    return "file";
  }
  Id?: number;
  Url?: string;
  IsDeleted?: boolean;
}
