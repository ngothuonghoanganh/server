import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Address extends Model {
    static get tableName() {
        return "addresses";
    }

    id?: string;
    customerId?: string;
    provinceId?: string;
    province?:string;
    districtId?:string;
    district?:string;
    wardId?:string;
    ward?:string;
    street?: string;
    isDefault?:boolean;
    createdAt?: Date;
    updatedAt?: Date;

}