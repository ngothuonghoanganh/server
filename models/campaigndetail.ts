import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CampaignDetail extends Model {
  static get tableName() {
    return "campaignDetails";
  }

  id?: string;
  campaignId?: string;
  quantity?: Number;
  price?: Number;
  createdat?: Date;
  updatedat?: Date;
}
