
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import { Order } from "../models/orders";
import { OrderStatusHistory } from "../models/orderstatushistory";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import notif from "../services/realtime/notification";


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
                .where("orderCode", orderStatusHistory.orderCode);
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
                .where('orderCode', orderCode).orderBy('createdAt', 'asc')
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
                    retailOrderId: orderId,
                    image: JSON.stringify(image),
                    orderCode: orderCode,
                    description: description,
                    orderStatus: status,
                })
            } else {
                insertData = await OrderStatusHistory.query().insert({
                    type: 'campaign',
                    campaignOrderId: orderId,
                    image: JSON.stringify(image),
                    orderCode: orderCode,
                    description: description,
                    orderStatus: status,
                })
            };
            //if status = finishReturning -> send notif for customer + supplier
            if (status === 'finishReturning' || status === 'returningInProgress') {
                //send notif for customer
                let customerObj;
                let accountIdCus;
                if (type === 'retail') {
                    customerObj = await Order.query().select('customerId').where('id', orderId).first();
                    accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                } else {
                    customerObj = await CampaignOrder.query().select('customerId').where('id', orderId).first();
                    accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                }
                notif.sendNotiForWeb({
                    userid: accountIdCus.accountId,
                    link: orderCode,
                    message: "changed to " + status,
                    status: "unread"
                })
                //send notif for supplier
                let supplierDataForRetail;
                let supplierDataForCampaign;
                let accountIdSupp;
                if (type === 'retail') {
                    supplierDataForRetail = await Order.query().select('supplierId').where('id', orderId).first();
                    accountIdSupp = await Suppliers.query().select('accountId').where('id', supplierDataForRetail.supplierid).first();
                } else {
                    supplierDataForCampaign = await Products.query()
                        .select("products.supplierId")
                        .join("campaignOrder", "campaignOrder.productId", "products.id")
                        .where("campaignOrder.id", orderId).first();
                    accountIdSupp = await Suppliers.query().select('accountId').where('id', supplierDataForCampaign.supplierid).first();
                }
                notif.sendNotiForWeb({
                    userid: accountIdSupp.accountId,
                    link: orderCode,
                    message: "changed to " + status,
                    status: "unread"
                })
            } else if (status === 'requestAccepted') {
                //request lan 1 -> send notif for customer
                const requestReturnTime = await OrderStatusHistory.query().select('id').where('orderCode', orderCode).andWhere("orderStatus", "returning");
                if (requestReturnTime.length === 1) {
                    let customerObj;
                    let accountIdCus;
                    if (type === 'retail') {
                        customerObj = await Order.query().select('customerId').where('id', orderId).first();
                        accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                    } else {
                        customerObj = await CampaignOrder.query().select('customerId').where('id', orderId).first();
                        accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                    }
                    notif.sendNotiForWeb({
                        userid: accountIdCus.accountId,
                        link: orderCode,
                        message: "changed to " + status,
                        status: "unread"
                    })
                } else {
                    //request lan 2 -> send notif for customer + supp

                    //customer
                    let customerObj;
                    let accountIdCus;
                    if (type === 'retail') {
                        customerObj = await Order.query().select('customerId').where('id', orderId).first();
                        accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                    } else {
                        customerObj = await CampaignOrder.query().select('customerId').where('id', orderId).first();
                        accountIdCus = await Customers.query().select('accountId').where('id', customerObj.customerId).first();
                    }
                    notif.sendNotiForWeb({
                        userid: accountIdCus.accountId,
                        link: orderCode,
                        message: "changed to " + status,
                        status: "unread"
                    });

                    //supp
                    let supplierDataForRetail;
                    let supplierDataForCampaign;
                    let accountIdSupp;
                    if (type === 'retail') {
                        supplierDataForRetail = await Order.query().select('supplierId').where('id', orderId).first();
                        accountIdSupp = await Suppliers.query().select('accountId').where('id', supplierDataForRetail.supplierId).first();
                    } else {
                        supplierDataForCampaign = await Products.query()
                            .select("products.supplierId")
                            .join("campaignOrder", "campaignOrder.productId", "products.id")
                            .where("campaignOrder.id", orderId).first();
                        accountIdSupp = await Suppliers.query().select('accountId').where('id', supplierDataForCampaign.supplierId).first();
                    }
                    notif.sendNotiForWeb({
                        userid: accountIdSupp.accountId,
                        link: orderCode,
                        message: "changed to " + status,
                        status: "unread"
                    })
                }
            }
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
                .whereIn('orderCodes', orderCodes)
            console.log(data)
            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };

}

export default new OrderHistoryController();
