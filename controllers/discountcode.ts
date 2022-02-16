import console from "console";
import { DiscountCode } from "../models/discountcode";
import router from "../routes";
import product from "./product";

class DiscountCodeController {
    public createDiscountCode = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            // console.log(id + "test")
            let {
                code,
                description,
                startDate,
                endDate,
                quantity,
                status = "ready",
                productId,
                minimunPriceCondition,
                discountPrice
            } = req.body;

            const newDiscountcode: any = await DiscountCode.query()
                .insert({
                    supplierid: id,
                    code: code,
                    description: description,
                    startdate: startDate,
                    enddate: endDate,
                    quantity: quantity,
                    status: status,
                    productid: productId,
                    minimunpricecondition: minimunPriceCondition,
                    discountprice: discountPrice
                })

            return res.status(200).send({
                data: newDiscountcode,
                message: 'successful'
            })
        } catch (error) {
            console.log(error)
        }

    };

    public deactivateDiscountCode = async (req: any, res: any, next: any) => {
        try {

            const { discountCodeId } = req.params;

            // console.log(discountCodeId)
            await DiscountCode.query().update({
                status: "deactivated",
            })
                .where("id", discountCodeId)

            return res.status(200).send('deactivated')
        } catch (error) {
            console.log(error)
        }
    };

    public updateDiscountCode = async (req: any, res: any, next: any) => {
        const { discountCodeId } = req.params;
        try {
            let {
                code,
                description,
                minimunPriceCondition,
                productId,
                startDate,
                endDate,
                quantity,
                discountPrice,
                status = "ready"
            } = req.body;

            const updateCode: any = await DiscountCode.query()
                .update({
                    code: code,
                    description: description,
                    minimunpricecondition: minimunPriceCondition,
                    discountprice: discountPrice,
                    startdate: startDate,
                    enddate: endDate,
                    quantity: quantity,
                    status: status,
                    productid: productId
                })
                .where('id', discountCodeId)
            if (updateCode === 0) {
                return res.status(200).send({
                    message: 'not yet updated'
                })
            }
            return res.status(200).send({
                data: updateCode,
                message: 'updated discount code'
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getAllDiscountCodeBySupplierId = async (req: any, res: any, next: any) => {
        try {
            const supplierId = req.query.supplierId;
            // console.log(supplierId)
            const status = 'deactivated'
            const List = await DiscountCode.query()
                .select()
                .leftJoin('products', 'discountcode.productid', 'products.id')
                .where('discountcode.supplierid', supplierId)
                // .where('supplierid', supplierId)
                .andWhere('discountcode.status', '<>', status)
            return res.status(200).send({
                message: 'successful',
                data: List
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getAllDiscountCodeInSupplier = async (req: any, res: any, next: any) => {
        const supplierId = req.user.id;
        // console.log(supplierId)
        // const status = 'deactivated'
        const List: any = await DiscountCode.query()
            .select()
            .where('supplierid', supplierId)
        // .andWhere('status', '<>', status)

        return res.status(200).send({
            message: 'successful',
            data: List
        })
    };
}
export default new DiscountCodeController();
