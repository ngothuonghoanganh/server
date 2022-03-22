
import { CampaignHistory } from "../models/campaignhistory";
import { RetailHistory } from "../models/retailhistory";


class RetailHistoryController {
    public getRetailHistoryById = async (req: any, res: any, next: any) => {
        try {
            const id = req.query.id;

            const retailHistory = await RetailHistory.query()
                .select()
                .where('id', id).first()

            const campaignHistory = await CampaignHistory.query()
                .select()
                .where('id', id).first()

            return res.status(200).send({
                message: 'successful',
                data: ({ campaignHistory: campaignHistory,
                        retailHistory: retailHistory })
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getRetailHistoryByOrderId = async (req: any, res: any, next: any) => {
        // console.log('test')
        try {
            //order id can from retail history and campaign history
            const orderId = req.body.orderId;
            // console.log(orderId)
            const retailHistory = await RetailHistory.query()
                .select()
                .where('orderretailid', orderId)

            const campaignHistory =await CampaignHistory.query()
            .select()
            .where('ordercampaignid', orderId)
            return res.status(200).send({
                message: 'successful',
                data: ({
                    retailHistory: retailHistory,
                    campaignHistory: campaignHistory
                })
            })
        } catch (error) {
            console.log(error)
        }
    };

}

export default new RetailHistoryController();
