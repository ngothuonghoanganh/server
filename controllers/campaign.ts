import { Campaigns } from "../models/campaigns";
import knex from "knex";
import { Products } from "../models/products";
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";
import moment from "moment";
import { CampaignDetail } from "../models/campaigndetail";

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
        description,
        range = [],
      } = req.body;

      let newCampaign: any,
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
          description: description,
        });
        if (isShare) {
          for (const element of range) {
            element.campaignId = newCampaign.id;
          }

          const newDetails = await CampaignDetail.query().insert(range);
          newCampaign.range = newDetails;
        }

        return res.status(200).send({
          data: newCampaign,
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
        range = [],
      } = req.body;
      let campaign: any = null;
      campaign = await Campaigns.query()
        .select()
        .sum("maxquantity as maxquantitycampaign")
        .where("todate", ">=", Campaigns.raw("now()"))
        .andWhere("productid", productId)
        .andWhere("status", "active")
        .andWhere("id", "<>", campaignId)
        .first();
      // if (!campaign.maxquantitycampaign) {
      //   campaign.maxquantitycampaign = 0 + maxQuantity;
      // } else {
      campaign.maxquantitycampaign =
        (campaign.maxquantitycampaign || 0) + maxQuantity;
      // }
      const product = await Products.query()
        .select()
        .where("id", productId)
        .andWhere("quantity", ">=", parseInt(campaign.maxquantitycampaign));
      let numRecordUpdated = 0;
      if (product && product.length > 0) {
        const campaignReadyUpdate = await Campaigns.query()
          .select()
          .where("id", campaignId)
          .first();
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
          .andWhere("status", "ready");

        if (campaignReadyUpdate.status === "ready" && isShare) {

          await CampaignDetail.query().delete().where('campaignId', campaignId)
          for (const item of range) {
            item.campaignId = campaignId
          }
          console.log(range)
          await CampaignDetail.query().insert(range);
        }


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
              `sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
                count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting`
            )
          )
          .leftJoin(
            "campaignorder",
            "campaigns.id",
            "campaignorder.campaignid"
          )
          .where("campaigns.supplierid", supplierId)

          .groupBy("campaigns.id")
        : await Campaigns.query()
          .select(
            "campaigns.*",
            Campaigns.raw(
              `sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
                count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting`
            )
          )
          .leftJoin(
            "campaignorder",
            "campaignorder.id",
            "campaignorder.campaignid"
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

      const campaigns: any = await Campaigns.query()
        .select(
          "campaigns.*",
          Campaigns.raw(
            `sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")

        .whereIn("campaigns.productid", productIds)
        .andWhere("campaigns.status", status)
        .groupBy("campaigns.id");
      for (const element of campaigns) {
        if (element.isshare) {
          const campaignDetails = await CampaignDetail.query()
            .select()
            .where("campaignId", element.id);
          element.range = campaignDetails;
        }
      }
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
            `(select count(campaignorder.id) as numorder from campaignorder where campaignorder.campaignid = campaigns.id)`
          )
        )
        .join("products", "campaigns.productid", "products.id")
        .where("campaigns.supplierid", supplierId)
        .andWhere(cd => {
          if (req.query.productId) {
            cd.where('products.id', req.query.productId)
          }
        })

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

          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )

        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        .where("campaigns.id", campaignId)
        .groupBy("campaigns.id");

      const campaignDetails = await CampaignDetail.query()
        .select()
        .where("campaignId", campaign[0].id);

      campaign[0].range = campaignDetails;
      return res.status(200).send({
        data: campaign,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public changeStatusToActive = async (req: any, res: any) => {
    try {
      const { campaignId } = req.body;
      const statusActive = "active";

      const updateCampaignStatus = await Campaigns.query()
        .update({
          status: statusActive,
        })
        .where("id", campaignId)
        .andWhere("status", "ready");

      const product = await Campaigns.query()
        .select("productid", "code")
        .where("id", campaignId)
        .first();

      const updateProductStatus = await Products.query()
        .update({
          status: "incampaign",
        })
        .where("id", product.productid);
      const supplierId: any = Products.query()
        .select("categories.supplierid")
        .join("categories", "categories.id", "products.categoryid")
        .where("products.id", product.productid);

      const accountCustomer: any = await Customers.query()
        .select("customers.accountid")
        .join("loyalcustomer", "loyalcustomer.customerid", "customers.id")
        .where("loyalcustomer.supplierid", supplierId);

      const customerAccountIds = accountCustomer.map(
        (item: any) => item.accountid
      );

      for (const item of customerAccountIds) {
        notif.sendNotiForWeb({
          userid: item,
          link: campaignId,
          message: "campaign with code: " + product.code + " has started",
          status: "unread",
        });
      }

      return res.status(200).send({
        message: "successful",
        data: {
          updateProdStatus: updateProductStatus,
          updateCampaignStatus: updateCampaignStatus,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public searchCampaign = async (req: any, res: any) => {
    try {
      const value = req.body.value;
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];
      const campaign: any = await Campaigns.query()
        .select(
          "campaigns.*",
          ...listEntity,

          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join("products", "campaigns.productid", "products.id")
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        .where("campaigns.description", "like", "%" + value + "%")
        .orWhere("campaigns.code", "like", "%" + value + "%")
        .andWhere((cd) => {
          cd.where("campaigns.status", "active").orWhere(
            "campaigns.status",
            "ready"
          );
        })
        .groupBy("campaigns.id")
        .groupBy("products.id");

      let campaignDetails;
      for (const element of campaign) {
        if (element.isshare) {
          campaignDetails = await CampaignDetail.query()
            .select()
            .where("campaignId", element.id);
          element.range = campaignDetails;
        }
      }

      return res.status(200).send({
        message: "successful",
        data: ({
          campaign: campaign,
          CampaignDetails: campaignDetails
        })
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getEndingCampaignList = async (req: any, res: any) => {
    try {
      const value = moment().add(3, "days").toDate();
      console.log(value);
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];
      const campaignList: any = await Campaigns.query()
        .select(
          "campaigns.*",
          ...listEntity,

          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join("products", "campaigns.productid", "products.id")
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        .where("campaigns.todate", "<", value)
        .andWhere("campaigns.status", "active")
        .groupBy("campaigns.id")
        .groupBy("products.id");

      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignid",
          CampaignOrder.raw("SUM(quantity) as totalQuantity")
        )
        .where("status", "advanced")
        .groupBy("campaignid");

      for (const item of orderCampaign) {
        let campaign: any = await Campaigns.query()
          .select(
            "campaigns.*",
            Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
          )
          .join("products", "campaigns.productid", "products.id")
          .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
          .where("id", item.campaignid)
          .first();
        console.log(
          ((campaign.quantity * 0.8) as Number) < item["totalQuantity"]
        );
        if (((campaign.quantity * 0.8) as Number) < item["totalQuantity"]) {
          campaignList.push(campaign);
        }
      }

      return res.status(200).send({
        message: "successful",
        data: campaignList,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new Campaign();
