import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class SystemProfile extends Model {
  static get tableName() {
    return "systemProfiles";
  }

  id?: string;
  name?: string;
  avt?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  accountId?: string;
}
