import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Address extends Model {
  static get tableName() {
    return "addresses";
  }

  id?: string;
  customerId?: string;
  province?: string;
  street?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        customerid: object.customerId,
        province: object.province,
        street: object.street,
        isdefault: object.isDefault,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        customerId: object.customerid,
        province: object.province,
        street: object.street,
        isDefault: object.isdefault,
        createdAt: object.createdat,
        updatedAt: object.updatedat,
      };
    },
  };
}
