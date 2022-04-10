import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class OrderDetail extends Model {
  static get tableName() {
    return "orderDetails";
  }

  id?: string;
  productName?: string;
  quantity?: Number;
  price?: Number;
  note?: string;
  orderCode?: string;
  productId?: Number;
  totalPrice?:Number;
  image?: string;
  orderId?: string;
  comment?: string;
  rating?: Number;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        productname: object.productName,
        quantity: object.quantity,
        price: object.price,
        note: object.note,
        ordercode: object.orderCode,
        productid: object.productId,
        totalprice: object.totalPrice,
        image: object.image,
        orderid: object.orderId,
        comment: object.comment,
        rating: object.rating,
      }
    },
    format(object: any) {
      return {
        id: object.id,
        productName: object.productname,
        quantity: object.quantity,
        price: object.price,
        note: object.note,
        orderCode: object.ordercode,
        productId: object.productid,
        totalPrice: object.totalprice,
        image: object.image,
        orderId: object.orderid,
        comment: object.comment,
        rating: object.rating,
      }
    },
  }
}
