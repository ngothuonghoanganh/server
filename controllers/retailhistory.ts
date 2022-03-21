import { RetailHistory } from "../models/retailhistory";


class RetailHistoryController {
    public getRetailHistoryById = async (req: any, res: any, next: any) => {
        try {
            const retailHistoryId = req.query.retailHistoryId;

            const data = await RetailHistory.query()
                .select()
                .where('id', retailHistoryId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getRetailHistoryByOrderId = async (req: any, res: any, next: any) => {
        console.log('test')
        try {
            const orderId= req.body.orderId;

            const data = await RetailHistory.query()
                .select()
                .where('orderretailid', orderId).first()

                return res.status(200).send({
                    message: 'successful',
                    data: data
                })
        } catch (error) {
            console.log(error)
        }
    };


}

export default new RetailHistoryController();
