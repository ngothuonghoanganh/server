import { CampaignOrder } from "../models/campaingorder";
import { Comments } from "../models/comment";
import { OrderDetail } from "../models/orderdetail";
import { Order } from "../models/orders";

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
    }
  };

  public getCommentByOrderId = async (req: any, res: any, next: any) => {
    try {
      const orderId = req.body.orderId;
      const isCampaign = req.body.isCampaign;
      const ListEntity = [
        "customers.avt",
        "customers.firstname",
        "customers.lastname",
      ];
      let data = [];
      if (isCampaign) {
        data = await CampaignOrder.query()
          .select(
            "campaignorder.*",
            "campaignorder.comment",
            ...ListEntity,
            "campaignorder.rating"
          )
          .join("customers", "customers.id", "campaignorder.customerid")
          .where("campaignorder.id", orderId);
      } else {
        data = await OrderDetail.query()
          .select(
            "orderdetail.*",
            "orderdetail.comment",
            ...ListEntity,
            "orderdetail.rating"
          )
          .join("orders", "orders.id", "orderdetail.orderid")
          .join("customers", "customers.id", "orders.customerid")
          .where("orderdetail.id", orderId);
      }
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getCommentByProductId = async (req: any, res: any, next: any) => {
    try {
      const productId = req.params.productId;
      // console.log(productId)
      const ListEntity = [
        "customers.avt",
        "customers.firstname",
        "customers.lastname",
      ];

      const nullValue = "";

      // select * from campaignorder join customer on campaignorder.customerid = customer.id
      // where campaignorder.productid =${productId}
      // and where (campaignorder.comment <> ${""} or campaignorder.comment <> null )
      const campaignOrder: any = await CampaignOrder.query()
        .select("campaignorder.comment", ...ListEntity, "campaignorder.rating")
        .join("customers", "customers.id", "campaignorder.customerid")
        .where("campaignorder.productid", productId)
        .andWhere((cd) => {
          cd.where("campaignorder.comment", "<>", nullValue).orWhere(
            "campaignorder.comment",
            "<>",
            null
          );
        });

      const retailOrder: any = await OrderDetail.query()
        .select("orderdetail.comment", ...ListEntity, "orderdetail.rating")
        .join("orders", "orders.id", "orderdetail.orderid")
        .join("customers", "customers.id", "orders.customerid")
        .where("orderdetail.productid", productId)
        .andWhere((cd) => {
          cd.where("orderdetail.comment", "<>", nullValue).orWhere(
            "orderdetail.comment",
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
        .select("campaignorder.comment", "campaignorder.rating")
        .where("campaignorder.productid", productId)
        .andWhere("campaignorder.comment", "<>", nullValue);

      const retailOrder: any = await OrderDetail.query()
        .select("orderdetail.comment", "orderdetail.rating")
        .where("orderdetail.productid", productId)
        .andWhere("orderdetail.comment", "<>", nullValue);

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
      const ListEntity = [
        "orderdetail.id as orderDetailId",
        "orders.status as orderStatus",
        "orderdetail.productid as productId",
      ];
      const numOfOrderCompletedByProductId = await OrderDetail.query()
        .select(...ListEntity)
        .join("orders", "orderdetail.orderid", "orders.id")
        .whereIn("orderdetail.productid", productIds)
        .andWhere("orders.status", status)
        .groupBy("orderdetail.id")
        .groupBy("orders.id");

      // console.log(numOfOrderCompletedByProductId)
      // const counts = numOfOrderCompletedByProductId.reduce((c, { productId : key }) => (c[key] = (c[key] || 0) + 1, c), {});
      const result = numOfOrderCompletedByProductId.reduce((r, a: any) => {
        r[a.productId] = r[a.productId] || [];
        r[a.productId].push(a);
        return r;
      }, Object.create({}));

      return res.status(200).send({
        message: "successful",
        data: { result },
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new Comment();
