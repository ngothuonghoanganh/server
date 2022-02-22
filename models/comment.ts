import { Model } from 'objection'
import * as connection from './db/connection';

Model.knex(connection.knex)

export class Comments extends Model {
    static get tableName() {
        return 'comments';
    }
    id?:string;
    orderid?:string;
    productid?:string;
    vote?:Number;
    comment?: string;
    createdat?: Date;
    updatedat?: Date;

}