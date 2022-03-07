import { Campaigns } from "../models/campaigns";
import knex from "knex";
import { Products } from "../models/products";

class Campaign {
  async createCampaign(req: any, res: any, next: any) {
    try {
      const userId = req.user.id;
      const {
        productId,
        fromDate,
        toDate,
        quantity,
        price,
        maxQuantity = 0,
        isShare = false,
        advanceFee = 0,
        status = "ready",
      } = req.body;

      let newCampaign,
        campaign: any = null;
      campaign = await Campaigns.query()
        .select()
        .sum("maxquantity as maxquantitycampaign")
        .where("todate", ">=", Campaigns.raw("now()"))
        .andWhere("productid", productId)
        .andWhere("status", "active")
        .first();
      if (!campaign.maxquantitycampaign) campaign.maxquantitycampaign = 0;
      const product = await Products.query()
        .select()
        .where("id", productId)
        .andWhere(
          "quantity",
          ">=",
          parseInt(campaign.maxquantitycampaign) + maxQuantity
        );
      console.log(product);
      if (product && product.length > 0) {
        newCampaign = await Campaigns.query().insert({
          supplierid: userId,
          productid: productId,
          quantity: quantity,
          price: price,
          fromdate: fromDate,
          todate: toDate,
          isshare: isShare,
          maxquantity: maxQuantity,
          advancefee: advanceFee,
          status: status,
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
          message: "Max quantity in campaign is exceeded quantity of product",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateCompaign(req: any, res: any, next: any) {
    try {
      const campaignId = req.params.campaignId;
      const {
        productId,
        fromDate,
        toDate,
        quantity,
        price,
        maxQuantity = 0,
        isShare = false,
        advanceFee = 0,
      } = req.body;
      let newCampaign,
        campaign: any = null;
      campaign = await Campaigns.query()
        .select()
        .sum("maxquantity as maxquantitycampaign")
        .where("todate", ">=", Campaigns.raw("now()"))
        .andWhere("productid", productId)
        .andWhere("status", "active")
        .first();
      if (!campaign.maxquantitycampaign) campaign.maxquantitycampaign = 0;
      const product = await Products.query()
        .select()
        .where("id", productId)
        .andWhere(
          "quantity",
          ">=",
          parseInt(campaign.maxquantitycampaign) + maxQuantity
        );
      console.log(product);
      let numRecordUpdated = 0;
      if (product && product.length > 0) {
        numRecordUpdated = await Campaigns.query()
          .update({
            productid: productId,
            quantity: quantity,
            price: price,
            fromdate: fromDate,
            todate: toDate,
            maxquantity: maxQuantity,
            isshare: isShare,
            advancefee: advanceFee,
          })
          .where("id", campaignId)
          .andWhere("fromdate", ">=", Campaigns.raw("now()"))
          .andWhere("status", "ready");
      } else {
        return res.status(200).send({
          message: "Max quantity in campaign is exceeded quantity of product",
        });
      }
      return res.status(200).send({
        data: numRecordUpdated,
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
                `sum(case when orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
                count(orderdetail.id) filter (where orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
            .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
            .where("supplierid", supplierId)
            // .andWhere("campaigns.status", "active")
            .groupBy("campaigns.id")
        : await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
                count(orderdetail.id) filter (where orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin("orders", "campaigns.id", "orders.campaignid")
            .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
            // .where("campaigns.status", "active")
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
      const { status = "active" } = req.body;

      const campaigns = await Campaigns.query()
        .select(
          "campaigns.*",
          Campaigns.raw(
            `sum(case when orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
            count(orderdetail.id) filter (where orders.status <> 'canceled' and orders.status <> 'returned' and orders.status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("orders", "campaigns.id", "orders.campaignid")
        .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
        .whereIn("campaigns.productid", productIds)
        .andWhere("campaigns.status", status)
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
        .select(
          "campaigns.*",
          ...listEntity,
          Campaigns.raw(
            `(select count(orders.id) as numorder from orders where orders.campaignid = campaigns.id)`
          )
        )
        .join("products", "campaigns.productid", "products.id")
        .where("campaigns.supplierid", supplierId);
      // .andWhere("campaigns.status", "active");
      return res.status(200).send({
        data: campaigns,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  public getOneCompaignByCampaignId = async (req: any, res: any, next: any) => {
    try {
      const campaignId = req.params.campaignId;

      const campaign: any = await Campaigns.query()
        .select(
          "campaigns.*",
          // 'products.name as productname',
          Campaigns.raw(`
          sum(case when orders.status = 'advanced' then orderdetail.quantity else 0 end) as quantityorderwaiting,
          count(orders.id) filter (where orders.status = 'advanced') as numorderwaiting
          `)
        )
        // .join('products', 'campaigns.productid', 'products.id')
        .leftJoin("orders", "campaigns.id", "orders.campaignid")
        .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
        .where("campaigns.id", campaignId)
        .groupBy("campaigns.id");
      // console.log(campaign)

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
