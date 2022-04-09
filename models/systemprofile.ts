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

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        name: object.name,
        avt: object.avt,
        isdeleted: object.isDeleted,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        accountid: object.accountId,

      }
    },
    format(object: any) {
      return {
        id: object.id,
        name: object.name,
        avt: object.avt,
        isDeleted: object.isdeleted,
        createdAt: object.createdat,
        updatedAt: object.updatedat,
        accountId: object.accountid,
        
      }
    },
  }
}
