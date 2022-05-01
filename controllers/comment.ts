import { CampaignOrder } from "../models/campaingorder";
import { OrderDetail } from "../models/orderdetail";
import { Order } from "../models/orders";
import order from "./order";

class Comment {
  public updateComment = async (req: any, res: any, next: any) => {
    try {
      let { isCampaign, comment, orderId, rating } = req.body;
      let update;
      if (isCampaign) {
        update = await CampaignOrder.query()
          .update({
            comment: comment,
            rating: rating,
          })
          .where("id", orderId)
          .first();
      } else {
        update = await OrderDetail.query()
          .update({
            comment: comment,
            rating: rating,
          })
          .where("id", orderId)
          .first();
      }

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getCommentByOrderId = async (req: any, res: any, next: any) => {
    try {
      const orderId = req.body.orderId;
      const isCampaign = req.body.isCampaign;
      const ListEntity = [
        "customers.avt",
        "customers.firstName",
        "customers.lastName",
      ];
      let data = [];
      if (isCampaign) {
        data = await CampaignOrder.query()
          .select(
            //TODO ENTITY
            "campaignorder.*",
            "campaignOrders.comment",
            ...ListEntity,
            "campaignOrders.rating"
          )
          .join("customers", "customers.id", "campaignOrders.customerId")
          .where("campaignOrders.id", orderId);
      } else {
        data = await OrderDetail.query()
          .select(
            //TODO ENTITY
            "orderdetail.*",
            "orderDetails.comment",
            ...ListEntity,
            "orderDetails.rating"
          )
          .join("orders", "orders.id", "orderDetails.orderId")
          .join("customers", "customers.id", "orders.customerId")
          .where("orderDetails.id", orderId);
      }
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getCommentByProductId = async (req: any, res: any, next: any) => {
    try {
      const productId = req.params.productId;
      // console.log(productId)
      const ListEntity = [
        "customers.avt",
        "customers.firstName",
        "customers.lastName",
      ];

      const nullValue = "";

      // select * from campaignorder join customer on campaignorder.customerid = customer.id
      // where campaignorder.productid =${productId}
      // and where (campaignorder.comment <> ${""} or campaignorder.comment <> null )
      const campaignOrder: any = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaignOrders.comment",
          ...ListEntity,
          "campaignOrders.rating"
        )
        .join("customers", "customers.id", "campaignOrders.customerId")
        .where("campaignOrders.productId", productId)
        .andWhere((cd) => {
          cd.where("campaignOrders.comment", "<>", nullValue).orWhere(
            "campaignOrders.comment",
            "<>",
            null
          );
        });

      const retailOrder: any = await OrderDetail.query()
        .select(
          "orderdetail.*",
          "orderDetails.comment",
          ...ListEntity,
          "orderDetails.rating"
        )
        .join("orders", "orders.id", "orderDetails.orderId")
        .join("customers", "customers.id", "orders.customerId")
        .where("orderDetails.productId", productId)
        .andWhere((cd) => {
          cd.where("orderDetails.comment", "<>", nullValue).orWhere(
            "orderDetails.comment",
            "<>",
            null
          );
        });

      campaignOrder.push(...retailOrder);

      return res.status(200).send({
        message: "successful",
        data: campaignOrder,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public countNumOfCommentByProductId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const productId = req.body.productId;
      let totalNumOfComment = 0;
      let averageRating;
      const nullValue = "";

      const campaignOrder: any = await CampaignOrder.query()
        .select("campaignOrders.comment", "campaignOrders.rating")
        .where("campaignOrders.productId", productId)
        .andWhere("campaignOrders.comment", "<>", nullValue);

      const retailOrder: any = await OrderDetail.query()
        .select("orderDetails.comment", "orderDetails.rating")
        .where("orderDetails.productId", productId)
        .andWhere("orderDetails.comment", "<>", nullValue);

      campaignOrder.push(...retailOrder);

      if (campaignOrder.length > 0) {
        totalNumOfComment = campaignOrder.length;
        averageRating =
          campaignOrder
            .map((item: any) => item.rating)
            .reduce((prev: any, next: any) => prev + next) / totalNumOfComment;

        return res.status(200).send({
          message: "successful",
          data: { comments: campaignOrder, totalNumOfComment, averageRating },
        });
      }
      return res.status(200).send({
        message: "no result",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public countNumOfOrderCompleted = async (req: any, res: any, next: any) => {
    try {
      const productIds = req.body.productIds;
      const status = "completed";
      // const ListEntity = [
      //   "orderdetail.id as orderDetailId",
      //   "orders.status as orderStatus",
      //   "orderdetail.productid as productId",
      // ];
      const numOfOrderCompletedOrderDetail: any = await OrderDetail.query()
        .select('orderDetails.productId as productId')
        .join("orders", "orderDetails.orderId", "orders.id")
        .whereIn("orderDetails.productId", productIds)
        .andWhere("orders.status", status);

      const numOfOrderCompletedCampaignOrder: any = await CampaignOrder.query().select('campaigns.productId as productId')
        .join('campaigns', 'campaigns.id', 'campaignOrders.campaignId')
        .whereIn('campaigns.productId', productIds)
        .andWhere('campaignOrders.status', status)

      numOfOrderCompletedOrderDetail.push(...numOfOrderCompletedCampaignOrder);

      console.log(numOfOrderCompletedOrderDetail)
      console.log(numOfOrderCompletedCampaignOrder)

      // console.log(numOfOrderCompletedByProductId)
      // const counts = numOfOrderCompletedByProductId.reduce((c, { productId : key }) => (c[key] = (c[key] || 0) + 1, c), {});
      const result = numOfOrderCompletedOrderDetail.reduce((r: any, a: any) => {
        r[a.productId] = r[a.productId] || [];
        r[a.productId].push(a);
        return r;
      }, Object.create({}));

      return res.status(200).send({
        message: "successful",
        data: ({result: result})
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public disableComment = async (req: any, res: any) => {
    try {
      let { orderId, isCampaign } = req.body;
      // console.log(orderId)
      // console.log(isCampaign)

      const disableValue = "removed";
      let data;
      if (isCampaign) {
        data = await CampaignOrder.query()
          .update({
            comment: disableValue,
          })
          .where("id", orderId)
          .first();
        // console.log("test");
      } else {
        data = await OrderDetail.query()
          .update({
            comment: disableValue,
          })
          .where("id", orderId)
          .first();
      }

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

export default new Comment();
