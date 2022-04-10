import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class LoyalCustomer extends Model {
  static get tableName() {
    return "loyalCustomers";
  }
  id?: string;
  supplierId?: string;
  customerId?: string;
  numOfOrder?: number;
  numOfProduct?: string;
  discountPercent?: number;
  createdAt?: Date;
  status?: string;

  static columnNameMappers: any = {
    parse(object: any) {
        return {
            id: object.id,
            supplierid: object.supplierId,
            customerid: object.customerId,
            numoforder: object.numOfOrder,
            numofproduct: object.numOfProduct,
            discountpercent: object.discountPercent,
            createdat: object.createdAt,
            status: object.status,
        }
    },
    format(object: any) {
        return {
            id: object.id,
            supplierId: object.supplierid,
            customerId: object.customerid,
            numOfOrder: object.numoforder,
            numOfProduct: object.numofproduct,
            discountPercent: object.discountpercent,
            createdAt: object.createdat,
            status: object.status,
        }
    },
}
}
