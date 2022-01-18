import { Campaigns } from "../models/campaigns";
import knex from "knex";

class Campaign {
  async createCompaign(req: any, res: any, next: any) {
    try {
      const userId = req.user.id;
      const { productId, fromDate, toDate, quantity, price } = req.body;

      const newCampaign = await Campaigns.query().insert({
        supplierid: userId,
        productid: productId,
        quantity: quantity,
        price: price,
        fromdate: fromDate,
        todate: toDate,
      });

      return res.status(200).send({
        data: await Campaigns.query()
          .select()
          .where("id", newCampaign.id)
          .first(),
        message: "create successfully",
      });
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
                `sum(case when orders.status = 'ready' then orders.quantity else 0 end) as quantityOrderWaiting`
              )
            )
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
            .where("supplierid", supplierId)
            .andWhere("campaigns.status", "active")
            .groupBy("campaigns.id")
        : await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when orders.status = 'ready' then orders.quantity else 0 end) as quantityOrderWaiting`
              )
            )
            .sum("orders.quantity as quantityOrderWaiting")
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
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

  async getAllCampaignsInSupplier(req: any, res: any, next: any) {
    try {
      const supplierId = req.user.id;
      const campaigns = await Campaigns.query()
        .select()
        .where("supplierid", supplierId)
        .andWhere("status", "active");
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
        .select()
        .where("id", campaignId)
        .andWhere("status", "active")
        .first();

      return res.status(200).send({
        data: campaign,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default new Campaign();
