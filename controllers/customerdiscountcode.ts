import console from "console";
import { CustomerDiscountCode } from "../models/customerdiscountcode";
import { DiscountCode } from "../models/discountcode";

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

    public reduceDiscountUse = async (req: any, res: any, next: any) => {
        try {
            const status = 'used';
            const discountCodeId = req.body.discountCodeId;
            // const ListEntity =[
            //     'customerdiscountcode.customerid',
            //     'customerdiscountcode.discountcodeid',
            //     'customerdiscountcode.status'
            // ]
             
            const currentQuantity: any =await DiscountCode.query()
                .select('quantity')
                .where('id', discountCodeId)
                .first()
            // console.log(currentQuantity['quantity']);
            const updateQuantity: any=await DiscountCode.query()
                .update({
                    quantity: currentQuantity['quantity']-1
                })
                .where('id', discountCodeId)
            // console.log(updateQuantity)

            const updateStatusForCusDiscountCode: any = await CustomerDiscountCode.query()
                .update({
                    status: status
                })
                .where('discountcodeid', discountCodeId)
                .andWhere('status', 'ready')
            return res.status(200).send({
                message: 'successful',
                data: updateStatusForCusDiscountCode
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default new CustomerDiscountCodeController();
