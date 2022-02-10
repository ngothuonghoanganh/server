import { Campaigns } from "../models/campaigns";
import knex from "knex";
import { Products } from "../models/products";

class Campaign {
  async createCompaign(req: any, res: any, next: any) {
    try {
      const userId = req.user.id;
      const { productId, fromDate, toDate, quantity, price } = req.body;

      let newCampaign,
        isExistCampaign = null;
      isExistCampaign = await Campaigns.query()
        .select()
        .where("todate", ">=", Campaigns.raw("now()"))
        .andWhere("productid", productId)
        .andWhere("status",  "active");
      // console.log(isExistCampaign)
      if (!isExistCampaign || isExistCampaign.length === 0) {
        newCampaign = await Campaigns.query().insert({
          supplierid: userId,
          productid: productId,
          quantity: quantity,
          price: price,
          fromdate: fromDate,
          todate: toDate,
        });

        await Products.query()
          .update({
            status: "incampaign",
          })
          .where("id", productId);

        return res.status(200).send({
          data: await Campaigns.query()
            .select()
            .where("id", newCampaign.id)
            .first(),
          message: "campaign is created successfully",
        });
      } else {
        return res.status(200).send({
          message: "the product is in campaign",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateCompaign(req: any, res: any, next: any) {
    try {
      const campaignId = req.params.campaignId;
      const { productId, fromDate, toDate, quantity, price } = req.body;

      await Campaigns.query()
        .update({
          productid: productId,
          quantity: quantity,
          price: price,
          fromdate: fromDate,
          todate: toDate,
        })
        .where("id", campaignId)
        .andWhere("status", "active");

      return res.status(200).send({
        data: null,
        message: "update successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCompaign(req: any, res: any, next: any) {
    try {
      const campaignId = req.params.campaignId;

      await Campaigns.query()
        .update({
          status: "deactivate",
        })
        .where("id", campaignId)
        .andWhere("status", "active");

      return res.status(200).send({
        data: null,
        message: "delete successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCampaigns(req: any, res: any, next: any) {
    try {
      const supplierId = req.query.supplierId;
      // let listEntityies = ["sum(orders.quantity) as quantityOrderWaiting"];

      const campaigns = supplierId
        ? await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when orders.status = 'advanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
                count(orderdetail.id) filter (where orders.status = 'advanced') as numorderwaiting`
              )
            )
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
            .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
            .where("supplierid", supplierId)
            .andWhere("campaigns.status", "active")
            .groupBy("campaigns.id")
        : await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when orders.status = 'advanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
                count(orderdetail.id) filter (where orders.status = 'advanced') as numorderwaiting`
              )
            )
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
            .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
            .where("campaigns.status", "active")
            .groupBy("campaigns.id");

      return res.status(200).send({
        data: campaigns,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCampaignsAllowProductId(req: any, res: any, next: any) {
    try {
      const productIds = req.body.productIds;

      const campaigns = await Campaigns.query()
        .select(
          "campaigns.*",
          Campaigns.raw(
            `sum(case when orders.status = 'advanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
            count(orders.id) filter (where orders.status = 'advanced') as numorderwaiting
            `
          )
        )
        .leftJoin("orders", "campaigns.id", "orders.campaignid")
        .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
        .whereIn("campaigns.productid", productIds)
        .andWhere("campaigns.status", "active")
        .groupBy("campaigns.id");

      return res.status(200).send({
        data: campaigns,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCampaignsInSupplier(req: any, res: any, next: any) {
    try {
      const supplierId = req.user.id;
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];

      const campaigns = await Campaigns.query()
        .select("campaigns.*", ...listEntity)
        .join("products", "campaigns.productid", "products.id")
        .where("campaigns.supplierid", supplierId)
        .andWhere("campaigns.status", "active");
      return res.status(200).send({
        data: campaigns,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getOneCompaign(req: any, res: any, next: any) {
    try {
      const campaignId = req.params.campaignId;

      const campaign = await Campaigns.query()
        .select("campaigns.*", "products.name as productname")
        .join("products", "campaigns.productid", "products.id")
        .where("campaigns.id", campaignId)
        .andWhere("campaigns.status", "active")
        .first();

      return res.status(200).send({
        data: campaign,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

}

export default new Campaign();
