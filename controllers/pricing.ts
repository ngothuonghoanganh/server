import { Pricing } from "../models/pricing";

class PricingController {

    public create = async (req: any, res: any) => {
        let {
            platformFeePercent,
            paymentFeePercent,
        } = req.body;
        const status = 'active';

        const deactiveAllRecord = await Pricing.query().update({
            status: "deactivated",
        })

        const insert = await Pricing.query().insert({
            platformFeePercent: platformFeePercent,
            paymentFeePercent: paymentFeePercent,
            status: status
        })
        return res.status(200).send({
            message: "sucessful",
            data: insert
        })
    };

    public getAll = async (req: any, res: any) => {
        const data = await Pricing.query().select().orderBy('createdAt', 'DESC');
        return res.status(200).send({
            message: 'successful',
            data: data
        })
    };

    public delete = async (req: any, res: any) => {
        const pricingId = req.params.pricingId;
        const deleteRecord = await Pricing.query().del().where('id', pricingId);

        const data = await Pricing.query().select().orderBy('createdAt', 'DESC').first();
        await Pricing.query().update({
            status: 'active'
        })
        .where('id', data.id);
        return res.status(200).send({
            message: "sucessful",
            data: deleteRecord
        })
    };


}
export default new PricingController();
