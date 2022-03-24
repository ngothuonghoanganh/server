
import { CampaignOrder } from "../models/campaingorder";
import { OrderStatusHistory } from "../models/orderstatushistory";


class OrderHistoryController {
    public createHistory = async (orderStatusHistory: OrderStatusHistory) => {
        try {
            await OrderStatusHistory.query().insert({
                ...orderStatusHistory,
            });
        } catch (error) {
            console.log(error);
        }
    };

    public update = async (orderStatusHistory: OrderStatusHistory) => {
        try {
          await OrderStatusHistory.query()
            .update({
              ...orderStatusHistory,
            })
            .where("ordercode", orderStatusHistory.ordercode);
        } catch (error) {
          console.log(error);
        }
      };

    public getRetailHistoryById = async (req: any, res: any, next: any) => {
        try {
            const id = req.query.id;
            const history = await OrderStatusHistory.query()
                .select()
                .where('id', id)
            return res.status(200).send({
                message: 'successful',
                data: history
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getRetailHistoryByOrderId = async (req: any, res: any, next: any) => {
        try {
            //order id can from retail history and campaign history
            const orderCode = req.body.orderCode;
            // console.log(orderId)
            const history = await OrderStatusHistory.query()
                .select()
                .where('ordercode', orderCode)
            return res.status(200).send({
                message: 'successful',
                data: history

            })
        } catch (error) {
            console.log(error)
        }
    };

    public test = async (req: any, res: any, next: any) => {
        try {
            const retailOrderId = await CampaignOrder.query()
                .select('*',
                    CampaignOrder.raw(`ORDER BY 'createdat' DESC LIMIT 1`)
                )
                return res.status(200).send({
                    message: 'ok',
                    data: retailOrderId
                })
        } catch (error) {
            console.log(error)
        }
    }

}

export default new OrderHistoryController();
