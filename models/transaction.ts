import { Model } from "objection";
import * as connection from "./db/connection";

Model.knex(connection.knex);

export class Transaction extends Model {
  static get tableName() {
    return "transactions";
  }

  id?: string;
  supplierId?: string;
  amount?: Number;
  orderCode?: string;
  advanceFee?: Number;
  orderValue?: Number;
  paymentFee?: Number;
  platformFee?: Number;
  penaltyFee?: Number;
  type?: string;
  isWithdrawable?: boolean;
  description?: string;
  content?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;

  static columnNameMappers: any = {
    parse(object: any) {
      return {
        id: object.id,
        supplierid: object.supplierId,
        amount: object.name,
        ordercode: object.orderCode,
        advancefee: object.advanceFee,
        ordervalue: object.orderValue,
        paymentfee: object.paymentFee,
        platformfee: object.platformFee,
        penaltyfee: object.penaltyFee,
        type: object.eWalletCode,
        iswithdrawable: object.isWithdrawable,
        description: object.description,
        content: object.content,
        status: object.status,
        createdat: object.createdAt,
        updatedat: object.updatedAt,

      }
    },
    format(object: any) {
      return {
        id: object.id,
        supplierId: object.supplierid,
        amount: object.name,
        orderCode: object.ordercode,
        advanceFee: object.advancefee,
        orderValue: object.ordervalue,
        paymentfee: object.paymentfee,
        paymentFee: object.platformfee,
        penaltyFee: object.penaltyfee,
        type: object.ewalletcode,
        isWithdrawable: object.iswithdrawable,
        description: object.description,
        content: object.content,
        status: object.status,
        createdAt: object.createdat,
        updatedAt: object.updatedat,
      }
    },
  }
}
