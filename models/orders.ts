import { Model } from "objection";
import { StringLiteralLike } from "typescript";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Order extends Model {
  static get tableName() {
    return "orders";
  }

  id?: string;
  status?: string;
  address?: boolean;
  paymentMethod?: string;
  customerId?: string;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  discountPrice?: string;
  shippingFee?: number;
  orderCode?: string;
  totalPrice?: string;
  customerDiscountCodeId?: string;
  productId?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        status: object.status,
        address: object.address,
        paymentmethod: object.paymentMethod,
        customerid: object.customerId,
        paymentid: object.paymentId,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        discountprice: object.discountPrice,
        shippingfee: object.shippingFee,
        ordercode: object.orderCode,
        totalprice: object.totalPrice,
        customerdiscountcodeid: object.customerDiscountCodeid,
        productid: object.productId,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        status: object.status,
        address: object.address,
        paymentMethod: object.paymentMethod,
        customerId: object.customerId,
        paymentId: object.paymentId,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        discountPrice: object.discountPrice,
        shippingFee: object.shippingFee,
        orderCode: object.orderCode,
        totalPrice: object.totalPrice,
        customerDiscountCodeid: object.customerDiscountCodeid,
        productId: object.productId,
      };
    },
  };
}
