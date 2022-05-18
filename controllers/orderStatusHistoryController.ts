import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import { Order } from "../models/orders";
import { OrderStatusHistory } from "../models/orderstatushistory";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import dbEntity from "../services/dbEntity";
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

  // public getRetailHistoryById = async (req: any, res: any, next: any) => {
  //   try {
  //     const id = req.query.id;
  //     const history = await OrderStatusHistory.query()
  //       .select(...dbEntity.orderStatusHistoriesEntity)
  //       .where("id", id);
  //     return res.status(200).send({
  //       message: "successful",
  //       data: history,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(400).send({ message: error });
  //   }
  // };

  public getRetailHistoryByOrderId = async (req: any, res: any, next: any) => {
    try {
      //order id can from retail history and campaign history
      const orderCode = req.body.orderCode;
      // console.log(orderId)
      const history = await OrderStatusHistory.query()
        .select(...dbEntity.orderStatusHistoriesEntity)
        .where("orderCode", orderCode)
        .orderBy("createdAt", "asc");
      return res.status(200).send({
        message: "successful",
        data: history,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public insertOrderHistoryForReturning = async (req: any, res: any) => {
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
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        }
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
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
            .select("supplierId")
            .where("id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountId")
            .where("id", supplierDataForRetail.supplierid)
            .first();
        } else {
          supplierDataForCampaign = await Products.query()
            .select("products.supplierId")
            .join("campaignOrders", "campaignOrders.productId", "products.id")
            .where("campaignOrders.id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountId")
            .where("id", supplierDataForCampaign.supplierid)
            .first();
        }
        notif.sendNotiForWeb({
          userId: accountIdSupp.accountId,
          link: orderCode,
          message: "Order " + orderCode + " has been set to " + status,
          status: "unread",
        });
      } else if (status === "requestAccepted") {
        //request lan 1 -> send notif for customer
        const requestReturnTime = await OrderStatusHistory.query()
          .select("id")
          .where("orderCode", orderCode)
          .andWhere("orderStatus", "returning");
        if (requestReturnTime.length === 1) {
          let customerObj;
          let accountIdCus;
          if (type === "retail") {
            customerObj = await Order.query()
              .select("customerId")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountId")
              .where("id", customerObj.customerId)
              .first();
          } else {
            customerObj = await CampaignOrder.query()
              .select("customerId")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountId")
              .where("id", customerObj.customerId)
              .first();
          }
          notif.sendNotiForWeb({
            userId: accountIdCus.accountId,
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
              .select("customerId")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountId")
              .where("id", customerObj.customerId)
              .first();
          } else {
            customerObj = await CampaignOrder.query()
              .select("customerId")
              .where("id", orderId)
              .first();
            accountIdCus = await Customers.query()
              .select("accountId")
              .where("id", customerObj.customerId)
              .first();
          }
          notif.sendNotiForWeb({
            userId: accountIdCus.accountId,
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
              .select("supplierId")
              .where("id", orderId)
              .first();
            accountIdSupp = await Suppliers.query()
              .select("accountId")
              .where("id", supplierDataForRetail.supplierId)
              .first();
          } else {
            supplierDataForCampaign = await Products.query()
              .select("products.supplierId")
              .join("campaignOrders", "campaignOrders.productId", "products.id")
              .where("campaignOrders.id", orderId)
              .first();
            accountIdSupp = await Suppliers.query()
              .select("accountId")
              .where("id", supplierDataForCampaign.supplierId)
              .first();
          }
          notif.sendNotiForWeb({
            userId: accountIdSupp.accountId,
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
      return res.status(400).send({ message: error });
    }
  };

  public getOrderHistoryByOrderCodeList = async (req: any, res: any) => {
    try {
      const orderCodes = req.body.orderCodes;
      // console.log(orderCodes)
      const data = await OrderStatusHistory.query()
        .select(...dbEntity.orderStatusHistoriesEntity)
        .whereIn("orderCode", orderCodes);
      console.log(data);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}

export default new OrderHistoryController();
