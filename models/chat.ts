import { ColumnNameMappers, Model } from 'objection'
import * as connection from './db/connection';

Model.knex(connection.knex)

export class Chat extends Model {
    static get tableName() {
        return 'chatMessages';
    }

    id?: string;
    from?: string;
    to?: string;
    message?: string;
    file?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}