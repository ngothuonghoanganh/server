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
  eWalletSecret?: string;
  identificationCard?: string;
  identificationImage?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        accountid: object.accountId,
        name: object.name,
        email: object.email,
        avt: object.avt,
        isdeleted: object.isDeleted,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        address: object.address,
        ewalletcode: object.eWalletCode,
        ewalletsecret: object.eWalletSecret,
        identificationcard: object.identificationCard,
        identificationimage: object.identificationImage,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        accountId: object.accountId,
        name: object.name,
        email: object.email,
        avt: object.avt,
        isDeleted: object.isDeleted,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        address: object.address,
        eWalletCode: object.eWalletCode,
        eWalletSecret: object.eWalletSecret,
        identificationCard: object.identificationCard,
        identificationImage: object.identificationImage,
      };
    },
  };
}
