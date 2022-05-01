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
        .where("ordercode", orderStatusHistory.orderCode);
    } catch (error) {
      console.log(error);
    }
  };

  public getRetailHistoryById = async (req: any, res: any, next: any) => {
    try {
      const id = req.query.id;
      const history = await OrderStatusHistory.query().select().where("id", id);
      return res.status(200).send({
        message: "successful",
        data: history,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getRetailHistoryByOrderId = async (req: any, res: any, next: any) => {
    try {
      //order id can from retail history and campaign history
      const orderCode = req.body.orderCode;
      // console.log(orderId)
      const history = await OrderStatusHistory.query()
        .select()
        .where("ordercode", orderCode)
        .orderBy("createdat", "asc");
      return res.status(200).send({
        message: "successful",
        data: history,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public insertOrderHistoryForReturning = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      //no role required
      //no login

      //status tùy từng loại mà insert
      let { orderId, orderCode, type, description, image, status } = req.body;
      let insertData;
      if (type === "retail") {
        insertData = await OrderStatusHistory.query().insert({
          type: "retail",
          retailOrderId: orderId,
          image: JSON.stringify(image),
          orderCode: orderCode,
          description: description,
          orderStatus: status,
        });
      } else {
        insertData = await OrderStatusHistory.query().insert({
          type: "campaign",
          campaignOrderId: orderId,
          image: JSON.stringify(image),
          orderCode: orderCode,
          description: description,
          orderStatus: status,
        });
      }
      //if status = finishReturning -> send notif for customer + supplier
      if (status === "finishReturning" || status === "returningInProgress") {
        //send notif for customer
        let customerObj;
        let accountIdCus;
        if (type === "retail") {
          customerObj = await Order.query()
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerId)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerId)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdCus.accountId,
          link: orderCode,
          message: "Order " + orderCode + " has been set to " + status,
          status: "unread",
        });

        //TODO: supplier id do not have in order and product
        //send notif for supplier
        let supplierDataForRetail: any;
        let supplierDataForCampaign: any;
        let accountIdSupp;
        if (type === "retail") {
          supplierDataForRetail = await Order.query()
            .select("supplierid")
            .where("id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountid")
            .where("id", supplierDataForRetail.supplierid)
            .first();
        } else {
          supplierDataForCampaign = await Products.query()
            .select("products.supplierid")
            .join("campaignorder", "campaignorder.productid", "products.id")
            .where("campaignorder.id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountid")
            .where("id", supplierDataForCampaign.supplierid)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdSupp.accountId,
          link: orderCode,
          message: "Order " + orderCode + " has been set to " + status,
          status: "unread",
        });
      } else if (status === "requestAccepted") {
        //request lan 1 -> send notif for customer
        const requestReturnTime = await OrderStatusHistory.query()
          .select("id")
          .where("ordercode", orderCode)
          .andWhere("statushistory", "returning");
        if (requestReturnTime.length === 1) {
          let customerObj;
          let accountIdCus;
          if (type === "retail") {
            customerObj = await Order.query()
              .select("customerid")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountid")
              .where("id", customerObj.customerId)
              .first();
          } else {
            customerObj = await CampaignOrder.query()
              .select("customerid")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountid")
              .where("id", customerObj.customerId)
              .first();
          }
          notif.sendNotiForWeb({
            userid: accountIdCus.accountId,
            link: orderCode,
            message: "Order " + orderCode + " has been set to " + status,
            status: "unread",
          });
        } else {
          //request lan 2 -> send notif for customer + supp

          //customer
          let customerObj;
          let accountIdCus;
          if (type === "retail") {
            customerObj = await Order.query()
              .select("customerid")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountid")
              .where("id", customerObj.customerId)
              .first();
          } else {
            customerObj = await CampaignOrder.query()
              .select("customerid")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountid")
              .where("id", customerObj.customerId)
              .first();
          }
          notif.sendNotiForWeb({
            userid: accountIdCus.accountId,
            link: orderCode,
            message: "Order " + orderCode + " has been set to " + status,
            status: "unread",
          });

          //supp
          //TODO: supplierId do not have in campaignorder and retailorder
          let supplierDataForRetail: any;
          let supplierDataForCampaign: any;
          let accountIdSupp;
          if (type === "retail") {
            supplierDataForRetail = await Order.query()
              .select("supplierid")
              .where("id", orderId)
              .first();
            accountIdSupp = await Suppliers.query()
              .select("accountid")
              .where("id", supplierDataForRetail.supplierId)
              .first();
          } else {
            supplierDataForCampaign = await Products.query()
              .select("products.supplierid")
              .join("campaignorder", "campaignorder.productid", "products.id")
              .where("campaignorder.id", orderId)
              .first();
            accountIdSupp = await Suppliers.query()
              .select("accountid")
              .where("id", supplierDataForCampaign.supplierId)
              .first();
          }
          notif.sendNotiForWeb({
            userid: accountIdSupp.accountId,
            link: orderCode,
            message: "Order " + orderCode + " has been set to " + status,
            status: "unread",
          });
        }
      }
      return res.status(200).send({
        message: "successful",
        data: insertData,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderHistoryByOrderCodeList = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const orderCodes = req.body.orderCodes;
      // console.log(orderCodes)
      const data = await OrderStatusHistory.query()
        .select()
        .whereIn("ordercode", orderCodes);
      console.log(data);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new OrderHistoryController();
