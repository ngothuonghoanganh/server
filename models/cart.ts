import { Model } from "objection"
import * as connection from './db/connection'

Model.knex(connection.knex)

export class Cart extends Model{
    static get tableName(){
        return 'cart'
    }

    id?: string;
    productid?: string;
    userid?: string;
    quantity?: string;
    createdat?: Date;
    updatedat?: Date;
    typeofproduct?: string;

}