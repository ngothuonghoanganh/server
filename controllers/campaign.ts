import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
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
        .sum("maxQuantity as maxquantitycampaign")
        .where("toDate", ">=", Campaigns.raw("now()"))
        .andWhere("productId", productId)
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
          supplierId: userId,
          productId: productId,
          quantity: quantity,
          price: price,
          fromDate: fromDate,
          toDate: toDate,
          isShare: isShare,
          maxQuantity: maxQuantity,
          advanceFee: advanceFee,
          status: status,
        });

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

  async updateCampaign(req: any, res: any, next: any) {
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
      let campaign: any = null;
      campaign = await Campaigns.query()
        .select()
        .sum("maxQuantity as maxquantitycampaign")
        .where("toDate", ">=", Campaigns.raw("now()"))
        .andWhere("productId", productId)
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
            productId: productId,
            quantity: quantity,
            price: price,
            fromDate: fromDate,
            toDate: toDate,
            maxQuantity: maxQuantity,
            isShare: isShare,
            advanceFee: advanceFee,
          })
          .where("id", campaignId)

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

  async deleteCampaign(req: any, res: any, next: any) {
    try {
      const campaignId = req.params.campaignId;

      const campaign = await Campaigns.query()
        .update({
          status: "deactivated",
        })
        .where("id", campaignId)
        .andWhere("status", "ready");

      if (campaign === 0) {
        return res.status(200).send("no active campaign found");
      }

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

      const campaigns = supplierId
        ? await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when campaignOrders.status <> 'cancelled' and campaignOrders.status <> 'returned' and campaignOrders.status <> 'notAdvanced' then campaignOrders.quantity else 0 end) as quantityorderwaiting,
                count(campaignOrders.id) filter (where campaignOrders.status <> 'cancelled' and campaignOrders.status <> 'returned' and campaignOrders.status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin(
              "campaignOrders",
              "campaigns.id",
              "campaignOrders.campaignId"
            )
            .where("campaigns.supplierId", supplierId)

            .groupBy("campaigns.id")
        : await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when campaignOrders.status <> 'cancelled' and campaignOrders.status <> 'returned' and campaignOrders.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
                count(campaignOrders.id) filter (where campaignOrders.status <> 'cancelled' and campaignOrders.status <> 'returned' and campaignOrders.status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin(
              "campaignOrders",
              "campaigns.id",
              "campaignOrders.campaignId"
            )

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
          CampaignOrder.raw(
            `sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .whereIn("campaigns.productId", productIds)
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
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];

      const campaigns = await Campaigns.query()
        .select(
          "campaigns.*",
          ...listEntity
          // Campaigns.raw(
          //   `(select count(campaignOrders.id) as numorder from campaignOrders where campaignOrders.campaignId = campaigns.id)`
          // )
        )
        .join("products", "campaigns.productId", "products.id")
        .where("campaigns.supplierId", supplierId);

      return res.status(200).send({
        data: campaigns,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  public getOneCampaignByCampaignId = async (req: any, res: any, next: any) => {
    try {
      const campaignId = req.params.campaignId;

      const campaign: any = await Campaigns.query()
        .select(
          "campaigns.*",
          Campaigns.raw(
            `sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
          count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .where("campaigns.id", campaignId)
        .groupBy("campaigns.id");

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
