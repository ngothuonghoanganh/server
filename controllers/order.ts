import { Order } from "../models/orders";
import console from "console";


class OrderController {
    public createOrder = async (req: any, res: any, next: any) => {
        try {
            let {
                customerId,
                productId,
                productName,
                quantity,
                isWholeSale = false,
                price,
                typeofproduct,
                customerDiscountCodeId = "",
                status,
                campaignId,
                addressId,
                paymentId,
                discountPrice = "",
                shippingFee = "",
                notes = ""
            } = req.body

            const prod: any = await Order.query()
                .insert({
                    customerid: customerId,
                    productid: productId,
                    productname: productName,
                    quantity: quantity,
                    iswholesale: isWholeSale,
                    price: price,
                    typeofproduct: typeofproduct,
                    customerdiscountid: customerDiscountCodeId,
                    status: status,
                    campaignid: campaignId,
                    addressId: addressId,
                    paymentid: paymentId,
                    discountprice: discountPrice,
                    shippingfee: shippingFee,
                    notes: notes
                })
            return res.status(200).send({
                message: "successful",
                data: prod
            })
        } catch (error) {
            console.log(error)
        }

    }
}

export default new OrderController();
