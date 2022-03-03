import console from "console";
import { CustomerDiscountCode } from "../models/customerdiscountcode";

class CustomerDiscountCodeController {
    public createCustomerDiscountCode = async (req: any, res: any, next: any) => {
        try {
            let {
                discountCodeId,
                quantity,
                status = "ready",
                customerId
            } = req.body;

            let createCode = await CustomerDiscountCode.query()
                .insert({
                    discountcodeid: discountCodeId,
                    quantity: quantity,
                    status: status,
                    customerid: customerId
                })

            return res.status(200).send({
                message: "successful",
                data: createCode,
            });
        } catch (error) {
            console.log(error)
        }
    };

    public getListDiscountCodeByStatus = async (req: any, res: any, next: any) => {
        try {
            const status = req.query.status;
            // console.log(status)
            const ListEntity = [
                'customerdiscountcode.customerid as customerId',
                'customerdiscountcode.discountcodeid as discountCodeId',
                'customerdiscountcode.status as customerDiscountCodeStatus',
            ]
            // console.log(status)
            const listDiscountCode: any = await CustomerDiscountCode.query()
                .select('discountcode.*', ListEntity)
                .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                .where('customerdiscountcode.status', status);

            return res.status(200).send({
                message: 'successful',
                data: listDiscountCode
            })
        } catch (error) {
            console.log(error)
        }
    };

    public UpdateStatusToUsed = async (req: any, res: any, next: any) => {
        try {
            const status = 'used';
            const update = await CustomerDiscountCode.query()
                .update({
                    status: status
                })
                .where('status', 'ready')

        } catch (error) {
            console.log(error)
        }
    }
}

export default new CustomerDiscountCodeController();
