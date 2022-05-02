import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Comments extends Model {
  static get tableName() {
    return "comments";
  }
  id?: string;
  oderdetailid?: string;
  productid?: string;
  rating?: Number;
  comment?: string;
  customerid?: string;
  createdat?: Date;
  updatedat?: Date;
  campaignorderid?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        oderdetailid: object.oderDetailId,
        productid: object.productId,
        rating: object.rating,
        comment: object.comment,
        customerid: object.customerId,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        campaignorderid: object.campaignOrderId,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        oderDetailId: object.oderDetailId,
        productId: object.productId,
        rating: object.rating,
        comment: object.comment,
        customerId: object.customerId,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        campaignOrderId: object.campaignOrderId,
      };
    },
  };
}
