import { Model } from 'objection'
import * as connection from './db/connection';

Model.knex(connection.knex)

export class Categories extends Model {
    static get tableName() {
        return 'categories';
    }

    id?: string;
    categoryName?: string;
    supplierId?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    static columnNameMappers: any = {
        parse(object: any) {
            return {
                id: object.id,
                categoryname: object.categoryName,
                supplierid: object.supplierId,
                createdat: object.createdAt,
                updatedat: object.updatedAt,
                isdeleted: object.isDeleted,
            }
        },
        format(object: any) {
            return {
                id: object.id,
                categoryName: object.categoryname,
                supplierId: object.supplierid,
                createdAt: object.createdat,
                updatedAt: object.updatedat,
                isDeleted: object.isdeleted,
            }
        },
    }

}