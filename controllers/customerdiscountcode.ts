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
    }
}

export default new CustomerDiscountCodeController();
