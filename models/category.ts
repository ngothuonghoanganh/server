import { Model } from 'objection'
import * as connection from './db/connection';

Model.knex(connection.knex)

export class Categories extends Model {
    static get tableName() {
        return 'categories';
    }

    id?: string;
    categoryname?: string;
    userid?: string;
    createdat?: Date;
    updatedat?: Date;
    isdeleted?: boolean;

}