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
      }
    },
    format(object: any) {
      return {
        id: object.id,
        accountId: object.accountid,
        firstName: object.firstname,
        lastName: object.lastname,
        email: object.email,
        avt: object.avt,
        isDeleted: object.isdeleted,
        createdAt: object.createdat,
        updatedAt: object.updatedat,
      }
    },
  }
}
