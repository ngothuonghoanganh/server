import { Model } from "objection";
import * as connection from "./db/connection";

// Model.knex(connection.knex);

export class Cart {
  campaignid: string
  customerid: string
  id: string
  inCampaign: boolean
  productid: string
  quantity: number
  supplierid: string

  constructor(campaignid: string, customerid: string, id: string, inCamapaign: boolean, productid: string, quantity: number, supplierid: string) {
    this.campaignid = campaignid
    this.customerid = customerid
    this.id = id
    this.inCampaign = inCamapaign
    this.productid = productid
    this.quantity = quantity
    this.supplierid = supplierid
  }

}
