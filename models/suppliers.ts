import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Suppliers extends Model {
  static get tableName() {
    return "suppliers";
  }
  id?: string;
  accountId?: string;
  name?: string;
  email?: string;
  avt?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  address?: string;
  eWalletCode?: string;
  eWalletSecrect?: string;
  identificationCard?: string;
  identificationImage?: string;
}
