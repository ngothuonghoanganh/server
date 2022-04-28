import { Campaigns } from "../models/campaigns";
import { Products } from "../models/products";
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";
import moment from "moment";
import { Suppliers } from "../models/suppliers";
import { OrderStatusHistory } from "../models/orderstatushistory";
import orderStatusHistoryController from "./orderStatusHistoryController";

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

      if (isShare) {
        let availableCampaign = null;
        availableCampaign = await Campaigns.query()
          .select()
          .where("productid", productId)
          .andWhere("isshare", true)
          .andWhere("todate", ">", fromDate)
          .andWhere("fromdate", "<", toDate)
          .andWhere((cd) => {
            cd.where("status", "ready").orWhere("status", "active");
          });
        if (availableCampaign.length > 0) {
          return res.status(200).send({
            message: "There is another campaign set during this time",
          });
        }
      }

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
          range: JSON.stringify(range),
        });
        // if (isShare) {
        //   for (const element of range) {
        //     element.campaignId = newCampaign.id;
        //   }

        //   const newDetails = await CampaignDetail.query().insert(range);
        //   newCampaign.range = newDetails;
        // }

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
      if (isShare) {
        let availableCampaign = null;
        availableCampaign = await Campaigns.query()
          .select()
          .where("productid", productId)
          .andWhere("isshare", true)
          .andWhere("todate", ">", fromDate)
          .andWhere("fromdate", "<", toDate)
          .andWhere((cd) => {
            cd.where("status", "ready").orWhere("status", "active");
          });
        if (availableCampaign.length > 0) {
          return res.status(200).send({
            message: "There is another campaign set during this time",
          });
        }
      }

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
            range: JSON.stringify(range),
          })
          .where("id", campaignId)
          .andWhere("status", "ready");

        // if (campaignReadyUpdate.status === "ready" && isShare) {

        //   await CampaignDetail.query().delete().where('campaignId', campaignId)
        //   for (const item of range) {
        //     item.campaignId = campaignId
        //   }
        //   console.log(range)
        //   await CampaignDetail.query().insert(range);
        // }
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
      // for (const element of campaigns) {
      //   if (element.isshare) {
      //     const campaignDetails = await CampaignDetail.query()
      //       .select()
      //       .where("campaignId", element.id);
      //     element.range = campaignDetails;
      //   }
      // }
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
        .andWhere((cd) => {
          if (req.query.productId) {
            cd.where("products.id", req.query.productId);
          }
        });

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
        .groupBy("campaigns.id")
        .first();

      let startable = true;
      let reason = "";
      console.log(campaign.status);
      if (campaign.status !== "ready") {
        startable = false;
        reason = "Only ready campaign can be started";
      } else if (campaign.isshare === "true") {
        const campaignShare = await Campaigns.query()
          .select()
          .where("productid", campaign.productid)
          .andWhere("isshare", true)
          .andWhere("status", "active");
        if (campaignShare) {
          startable = false;
          reason = "Another sharing campaign is ongoing";
        } else {
          var currentDate = moment().format();
          const campaignShare = await Campaigns.query()
            .select()
            .where("productid", campaign.productid)
            .andWhere("isshare", true)
            .andWhere("status", "ready")
            .andWhere("fromdate", "<", campaign.fromdate)
            .andWhere("fromdate", ">", currentDate);
          if (campaignShare) {
            startable = false;
            reason = "There is another campaign set during this time";
          }
        }
      }

      const product = await Products.query()
        .select()
        .where("id", campaign.productid)
        .first();
      return res.status(200).send({
        message: "successfully",
        data: {
          campaign: campaign,
          startable: startable,
          product: product,
          reason: reason,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public changeStatusToActive = async (req: any, res: any) => {
    try {
      const { campaignId } = req.body;
      const statusActive = "active";

      var currentDate = moment().format();

      const campaign = await Campaigns.query()
        .select()
        .where("id", campaignId)
        .first();

      if (campaign.status !== "ready") {
        return res.status.send({
          message: "Only ready campaign can be started",
        });
      } else if (campaign.isshare) {
        const campaignShare = await Campaigns.query()
          .select()
          .where("productid", campaign.productid)
          .andWhere("isshare", true)
          .andWhere("status", "active");

        if (campaignShare) {
          return res.status.send({
            message: "Another sharing campaign is ongoing",
          });
        } else {
          var currentDate = moment().format();
          const campaignShare = await Campaigns.query()
            .select()
            .where("productid", campaign.productid)
            .andWhere("isshare", true)
            .andWhere("status", "ready")
            .andWhere("fromdate", "<", campaign.fromdate)
            .andWhere("fromdate", ">", currentDate);

          if (campaignShare)
            return res.status.send({
              message: "There is another campaign set during this time",
            });
        }
      }

      const updateCampaignStatus = await Campaigns.query()
        .update({
          status: statusActive,
          fromdate: currentDate,
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

      // let campaignDetails;
      // for (const element of campaign) {
      //   if (element.isshare) {
      //     campaignDetails = await CampaignDetail.query()
      //       .select()
      //       .where("campaignId", element.id);
      //     element.range = campaignDetails;
      //   }
      // }

      return res.status(200).send({
        message: "successful",
        data: {
          campaign: campaign,
        },
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

  public doneCampaignBySupp = async (req: any, res: any) => {
    try {
      let {
        campaignId
      } = req.body;
      // let campaign = null;
     const campaign = await Campaigns.query().select()
        .where('id', campaignId)
        .andWhere('status', 'active').first();
      console.log(campaign)
      if (campaign === undefined) {
        return res.status(200).send({
          message: 'Campaign not found',
        })
      }
      const ordersInCampaign: any = await CampaignOrder.query()
        .select()
        .where("campaignid", campaignId)
        .andWhere("status", "advanced");

      if (ordersInCampaign) {

        const orderId = ordersInCampaign.map((item: any) => item.id);
        await Promise.all([
          CampaignOrder.query()
            .update({
              status: "unpaid",
            })
            .whereIn("id", orderId)
            .andWhere("paymentmethod", "online"),
          CampaignOrder.query()
            .update({
              status: "created",
            })
            .whereIn("id", orderId)
            .andWhere("paymentmethod", "cod"),
        ]);

        await Campaigns.query()
          .update({ status: "done" })
          .where("id", campaignId);
        const getCampaigns = await Campaigns.query()
          .select()
          .where("productid", campaign.productid)
          .andWhere("status", "active");

        if (getCampaigns.length === 0) {
          await Products.query()
            .update({ status: "active" })
            .where("id", campaign.productid);
        }

        for (const item of ordersInCampaign) {
          orderStatusHistoryController.createHistory({
            statushistory:
              item.paymentmethod === "online" ? "unpaid" : "created",
            type: "campaign",
            campaignorderid: item.id,
            ordercode: item.ordercode,
            description:
              item.paymentmethod === "online"
                ? "requires full payment via VNPAY E-Wallet"
                : "is created",
          } as OrderStatusHistory);

          const customer = await Customers.query()
            .select()
            .where("id", item.customerid)
            .first();

          if (item.paymentMethod === "online") {
            notif.sendNotiForWeb({
              userid: customer.accountid,
              link: item.ordercode,
              message: "Order " + item.ordercode + "has been set to unpaid",
              status: "unread",
            });
          } else {
            notif.sendNotiForWeb({
              userid: customer.accountid,
              link: item.ordercode,
              message: "Order " + item.ordercode + "has been set to created",
              status: "unread",
            });
          }

          //update quantity of product
          await Products.query().update({
            quantity: Products.raw(`quantity - ${item.quantity}`)
          })
            .where('id', campaign.productid)

        }
        let supplierId;
        supplierId = await Suppliers.query()
          .select()
          .where("id", campaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: supplierId.accountid,
          link: campaign.code,
          message: `Campaign with code: ${campaign.code} has ended`,
          status: "unread",
        });

      }
      return res.status(200).send({
        message: "successful",
      })
    } catch (error) {
      console.log(error)
    }
  };

}


export default new Campaign();
