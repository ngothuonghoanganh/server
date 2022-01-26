import console from "console";
import { DiscountCode } from "../models/discountcode";
import router from "../routes";

class DiscountCodeController {
    public createDiscountCode = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            // console.log(id + "test")
            let {
                code,
                description,
                condition,
                percent,
                startDate,
                endDate,
                quantity,
                status = "ready"
            } = req.body;

            const newDiscountcode: any = await DiscountCode.query()
                .insert({
                    supplierid: id,
                    code: code,
                    description: description,
                    condition: condition,
                    percent: percent,
                    startdate: startDate,
                    enddate: endDate,
                    quantity: quantity,
                    status: status
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
                condition,
                percent,
                startDate,
                endDate,
                quantity,
                status = "ready"
            } = req.body;

            const updateCode: any = await DiscountCode.query()
                .update({
                    code: code,
                    description: description,
                    condition: condition,
                    percent: percent,
                    startdate: startDate,
                    enddate: endDate,
                    quantity: quantity,
                    status: status
                })
                .where('id', discountCodeId)

            return res.status(200).send({
                data: updateCode,
                message: 'updated discount code'
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getAllDiscountCodeBySupplierId = async (req: any, res: any, next: any) => {
        const supplierId = req.user.id;
        // console.log(supplierId)
        const List: any = await DiscountCode.query()
            .select()
            .where('supplierid', supplierId);

        return res.status(200).send({
            message: 'successful',
            data: List
        })
    };
}
export default new DiscountCodeController();
