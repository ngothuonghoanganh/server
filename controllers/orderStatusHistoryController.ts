
import { AnySchema } from "joi";
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

    //no use
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

    public insertOrderHistoryForReturning = async (req: any, res: any, next: any) => {
        try {
            //no role required
            //no login

            //status tùy từng loại mà insert
            let { orderId, orderCode, type, description, image, status } = req.body;
            let insertData
            if (type === 'retail') {
                insertData = await OrderStatusHistory.query().insert({
                    type: 'retail',
                    retailorderid: orderId,
                    image: JSON.stringify(image),
                    ordercode: orderCode,
                    description: description
                })
            } else {
                insertData = await OrderStatusHistory.query().insert({
                    type: 'campaign',
                    campaignorderid: orderId,
                    image: JSON.stringify(image),
                    ordercode: orderCode,
                    description: description
                })
            };

            return res.status(200).send({
                message: 'successful',
                data: insertData
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getOrderHistoryByOrderCodeList = async (req: any, res: any, next: any) => {
        try {
            const orderCodes = req.body.orderCodes;
            // console.log(orderCodes)
            const data = await OrderStatusHistory.query().select()
                .whereIn('ordercode', orderCodes)
            console.log(data)
            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    }

}

export default new OrderHistoryController();
