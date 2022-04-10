import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CampaignOrder extends Model {
  static get tableName() {
    return "campaignOrders";
  }
  id?: string;
  quantity?: Number;
  productName?: string;
  price?: Number;
  note?: string;
  image?: string;
  customerId?: string;
  status?: string;
  address?: string;
  paymentId?: string;
  shippingFee?: Number;
  advancedId?: string;
  advanceFee?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  orderCode?: string;
  discountPrice?: number;
  totalPrice?: number;
  paymentMethod?: string;
  campaignId?: string;
  comment?: string;
  rating?: Number;
  productId?: string;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        quantity: object.quantity,
        productname: object.productName,
        price: object.price,
        note: object.note,
        image: object.image,
        customerid: object.customerId,
        status: object.status,
        address: object.address,
        paymentid: object.paymentId,
        shippingfee: object.shippinFee,
        advancedid: object.advancedId,
        advancefee: object.advanceFee,
        createdat: object.createdAt,
        updatedat: object.updatedAt,
        ordercode: object.orderCode,
        discountprice: object.discountPrice,
        totalprice: object.totalPrice,
        paymentmethod: object.paymentMethod,
        campaignid: object.campaignId,
        comment: object.comment,
        rating: object.rating,
        productid: object.productId,
        ...object,
      };
    },
    format(object: any) {
      return {
        id: object.id,
        quantity: object.quantity,
        productName: object.productName,
        price: object.price,
        note: object.note,
        image: object.image,
        customerId: object.customerId,
        status: object.status,
        address: object.address,
        paymentId: object.paymentId,
        shippingFee: object.shippingFee,
        advancedId: object.advancedId,
        advanceFee: object.advanceFee,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        orderCode: object.orderCode,
        discountPrice: object.discountPrice,
        totalPrice: object.totalPrice,
        paymentMethod: object.paymentMethod,
        campaignId: object.campaignId,
        comment: object.comment,
        rating: object.rating,
        productId: object.productId,
      };
    },
  };
}
