import { Model } from "objection";
import * as connection from "./db/connection";

// Model.knex(connection.knex);

export class Cart extends Model {
  // static get tableName(){
  //     return 'cart'
  // }

  id?: string;
  customerid?: string;
  productid?: string;
  quantity?: Number;
  wholesale?: Number;
  typeofproduct?: string;
  createdat?: Date;
  updatedat?: Date;
}
