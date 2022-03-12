import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CampaignOrder extends Model {
  static get tableName() {
    return "campaignorder";
  }
  id?: string;
  quantity?: Number;
  productname?: string;
  price?: Number;
  notes?: string;
  productid?: string;
  image?: string;
  customerid?: string;
  status?: string;
  address?: string;
  paymentid?: string;
  shippingfee?: Number;
  supplierid?: string;
  reasonforupdatestatus?: string;
  advancedid?: string;
  advancefee?: Number;
  imageproof?: string;
  createdat?: Date;
  updatedat?: Date;


}