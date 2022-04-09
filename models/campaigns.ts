import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Campaigns extends Model {
  static get tableName() {
    return "campaigns";
  }

  id?: string;
  supplierid?: string;
  productid?: string;
  status?: string;
  fromdate?: Date;
  todate?: Date;
  quantity?: number;
  price?: number;
  createdat?: Date;
  updatedat?: Date;
  code?: string;
  description?:string;
  maxquantity?: number;
  isshare?: boolean;
  advancefee?: number;

  static columnNameMappers: any = {
    parse(object: any) {
        return {
            id: object.id,
            supplierid: object.supplierId,
            productid: object.productId,
            status: object.status,
            fromdate: object.fromDate,
            todate: object.toDate,
            quantity: object.quantity,
            price: object.price,
            createdat: object.createdAt,
            updatedat: object.updatedAt,
            code: object.code,
            description: object.description,
            maxquantity: object.maxQuantity,
            isshare: object.isShare,
            advancefee: object.advanceFee,            
        }
    },
    format(object: any) {
        return {
            id: object.id,
            supplierId: object.supplierid,
            productId: object.productid,
            status: object.status,
            fromDate: object.fromdate,
            toDate: object.todate,
            quantity: object.quantity,
            price: object.price,
            createdAt: object.createdat,
            updatedAt: object.updatedat,
            code: object.code,
            description: object.description,
            maxQuantity: object.maxquantity,
            isShare: object.isshare,
            advanceFee: object.advancefee,
        }
    },
}
}
