import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Customers extends Model {
  static get tableName() {
    return "customers";
  }

  id?: string;
  accountId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avt?: string;
  isDeleted?: boolean;
  createdat?: Date;
  updatedat?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        accountid: object.accountId,
        firstname: object.firstName,
        lastname: object.lastName,
        email: object.email,
        avt: object.avt,
        isdeleted: object.isDeleted,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        ...object
      }
    },
    format(object: any) {
      return {
        id: object.id,
        accountId: object.accountId,
        firstName: object.firstName,
        lastName: object.lastName,
        email: object.email,
        avt: object.avt,
        isDeleted: object.isDeleted,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
      }
    },
  }
}
