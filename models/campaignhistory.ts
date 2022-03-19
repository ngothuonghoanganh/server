import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CampaignHistory extends Model {
    static get tableName() {
        return "campaignhistory";
    }

    id?: string;
    ordercampaignid?: string;
    ordercode?: string;
    statushistory?: string;
    images?:boolean;
    description?: string;
    createdat?: Date;
    updatedat?: Date;

}