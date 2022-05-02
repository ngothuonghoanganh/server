import { Model } from "objection";
import { Tracing } from "trace_events";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CampaignOrder extends Model {
  static get tableName() {
    return "campaignOrders";
  }
  id?: string;
  quantity?: Number;
  price?: Number;
  note?: string;
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
  loyalCustomerDiscountPercent?: number;
}