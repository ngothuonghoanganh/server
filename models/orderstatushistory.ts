import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderStatusHistory extends Model {
  static get tableName() {
    return "orderStatusHistories";
  }

  id?: string;
  campaignOrderId?: string;
  orderCode?: string;
  orderStatus?: string;
  image?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  retailOrderId?: string;
  type?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        campaignorderid: object.campaignOrderId,
        ordercode: object.orderCode,
        orderstatus: object.orderStatus,
        image: object.image,
        description: object.description,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        retailoderid: object.retailOderId,
        type: object.type,
      }
    },
    format(object: any) {
      return {
        id: object.id,
        campaignOrderId: object.campaignorderid,
        orderCode: object.ordercode,
        orderStatus: object.orderstatus,
        image: object.image,
        description: object.description,
        createdAt: object.createdat,
        updatedAt: object.updatedat,
        retailOderId: object.retailoderid,
        type: object.type,
      }
    },
  }
}
