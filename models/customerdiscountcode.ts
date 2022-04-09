import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class CustomerDiscountCode extends Model {
    static get tableName() {
        return "customerdiscountcode";
    }

    id?: string;
    customerId?: string;
    code?: string;
    description?: string;
    minimumPriceCondition?: Number;
    startDate?: Date;
    endDate?: Date;
    quantity?: Number;
    createdAt?: Date;
    updatedAt?: Date;
    status?: string;
    discountPricde?: Number;

    static columnNameMappers: any = {
        parse(object: any) {
            return {
                id: object.id,
                customerid: object.customerId,
                code: object.code,
                description: object.description,
                minimumpricecondition: object.minimumPriceCondition,
                startdate: object.startDate,
                enddate: object.endDate,
                quantity: object.quantity,
                createdat: object.createdAt,
                updatedat: object.updatedAt,
                status: object.status,
            }
        },
        format(object: any) {
            return {
                id: object.id,
                customerId: object.customerid,
                code: object.code,
                description: object.description,
                minimumPriceCondition: object.minimumpricecondition,
                startDate: object.startdate,
                endDate: object.enddate,
                quantity: object.quantity,
                createdAt: object.createdat,
                updatedAt: object.updatedat,
                status: object.status,
            }
        },
    }
}