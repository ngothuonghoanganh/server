import {Model} from 'objection'
import * as connection from './db/connection' 

Model.knex(connection.knex)

export class Products extends Model{
    static get tableName(){
        return 'products';
    }

    id?: string;
    userid?: string;
    name?: string;
    retailprice?: number;
    wholesaleprice?: number;
    quantity?: number;
    quantityforwholesale?: number;
    description?: string;
    image?: string;
    categoriesid?: string;
    createdat?: Date;
    updatedat?: Date;

}