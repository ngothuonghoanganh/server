import { Campaigns } from "../models/campaigns";
import { Products } from "../models/products";
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";
import moment from "moment";
import { Suppliers } from "../models/suppliers";
import { OrderStatusHistory } from "../models/orderstatushistory";
import orderStatusHistoryController from "./orderStatusHistoryController";
import dbEntity from "../services/dbEntity";

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
          .select(...dbEntity.campaignEntity)
          .where("productId", productId)
          .andWhere("isShare", true)
          .andWhere("toDate", ">", fromDate)
          .andWhere("fromDate", "<", toDate)
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

      if (product && product.length > 0) {
        newCampaign = await Campaigns.query().insert({
          // supplierId: userId,
          productId: productId,
          quantity: quantity,
          price: price,
          fromDate: fromDate,
          toDate: toDate,
          isShare: isShare,
          maxQuantity: maxQuantity,
          advanceFee: advanceFee,
          status: status,
          description: description,
          range: JSON.stringify(range),
          // ...product,
          productName: product[0].name,
          image: product[0].image,
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
        fromdate,
        todate,
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
          .where("productId", productId)
          .andWhere("isShare", true)
          .andWhere("toDate", ">", fromdate)
          .andWhere("fromDate", "<", todate)
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
        .sum("maxQuantity as maxquantitycampaign")
        .where("toDate", ">=", Campaigns.raw("now()"))
        .andWhere("productId", productId)
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
        // const campaignReadyUpdate = await Campaigns.query()
        //   .select()
        //   .where("id", campaignId)
        //   .first();
        numRecordUpdated = await Campaigns.query()
          .update({
            productId: productId,
            quantity: quantity,
            price: price,
            fromDate: fromdate,
            toDate: todate,
            maxQuantity: maxQuantity,
            isShare: isShare,
            advanceFee: advanceFee,
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
          status: "stop",
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

      let prods = await Products.query()
        .select()
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        .where("categories.supplierId", supplierId || null);
      const productIds = prods.map((item: any) => item.id);

      const campaigns = supplierId
        ? await Campaigns.query()
            .select(
              ...dbEntity.campaignEntity,
              Campaigns.raw(
                `sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
                count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin(
              "campaignOrders",
              "campaigns.id",
              "campaignOrders.campaignId"
            )
            .whereIn("campaigns.productId", productIds)
            .groupBy("campaigns.id")
        : await Campaigns.query()
            .select(
              "campaigns.*",
              Campaigns.raw(
                `sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
                count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting`
              )
            )
            .leftJoin(
              "campaignOrders",
              "campaignOrders.id",
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

      const campaigns: any = await Campaigns.query()
        .select(
          ...dbEntity.campaignEntity,
          Campaigns.raw(
            `sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .whereIn("campaigns.productId", productIds)
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
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];

      let prods = await Products.query()
        .select()
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        .where("categories.supplierId", req.user.id)
        .andWhere((cd) => {
          if (req.query.productId) {
            cd.where("products.id", req.query.productId);
          }
        });

      const productIds = prods.map((item: any) => item.id);

      const campaigns = await Campaigns.query()
        .select(
          ...dbEntity.campaignEntity,
          ...listEntity,
          Campaigns.raw(
            `(select count("campaignOrders".id) as numorder from "campaignOrders" where "campaignOrders"."campaignId" = campaigns.id)`
          )
        )
        .join("products", "campaigns.productId", "products.id")
        .whereIn(`products.id`, productIds);

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
          ...dbEntity.campaignEntity,
          'categories.supplierId',
          Campaigns.raw(`
          sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting
          `)
        )

        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .join('products', 'campaigns.productId', 'products.id')
        .join('categories', 'categories.id', 'products.categoryId')
        .where("campaigns.id", campaignId)
        .groupBy("campaigns.id")
        .groupBy('categories.supplierId')
        .first();

      let startable = true;
      let reason = "";
      if (campaign.status !== "ready") {
        startable = false;
        reason = "Only ready campaign can be started";
      } else if (campaign.isshare === "true") {
        const campaignShare = await Campaigns.query()
          .select(...dbEntity.campaignEntity)
          .where("productId", campaign.productid)
          .andWhere("isShare", true)
          .andWhere("status", "active")
          .first();
        if (campaignShare) {
          startable = false;
          reason = "Another sharing campaign is ongoing";
        } else {
          var currentDate = moment().format();
          const campaignShare = await Campaigns.query()
            .select(...dbEntity.campaignEntity)
            .where("productId", campaign.productid)
            .andWhere("isShare", true)
            .andWhere("status", "ready")
            .andWhere("fromDate", "<", campaign.fromdate)
            .andWhere("fromDate", ">", currentDate);
          if (campaignShare.length > 0) {
            startable = false;
            reason = "There is another campaign set during this time";
          }
        }
      }

      const product = await Products.query()
        .select(...dbEntity.productEntity)
        .where("id", campaign.productid)
        .first();
        // const supplierId=await Suppliers.query().select('suppliers.id')
        // .join('categories', 'categories.supplierId', 'suppliers.id')
      return res.status(200).send({
        message: "successfully",
        data: {
          campaign: campaign,
          startable: startable,
          product: product,
          reason: reason,
          // supplierId: supplierId
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

      const campaign: any = await Campaigns.query()
        .select(...dbEntity.campaignEntity)
        .where("id", campaignId)
        .first();
      console.log(campaign);
      if (campaign.status !== "ready") {
        return res.status(200).send({
          message: "Only ready campaign can be started",
        });
      } else if (campaign.isShare) {
        const campaignShare = await Campaigns.query()
          .select(...dbEntity.campaignEntity)
          .where("productId", campaign.productid)
          .andWhere("isShare", true)
          .andWhere("status", "active")
          .first();

        if (campaignShare) {
          return res.status(200).send({
            message: "Another sharing campaign is ongoing",
          });
        } else {
          var currentDate = moment().format();
          const campaignShare = await Campaigns.query()
            .select()
            .where("productId", campaign.productid)
            .andWhere("isShare", true)
            .andWhere("status", "ready")
            .andWhere("fromDate", "<", campaign.fromDate)
            .andWhere("fromDate", ">", currentDate);

          if (campaignShare.length > 0)
            return res.status(200).send({
              message: "There is another campaign set during this time",
            });
        }
      }

      const updateCampaignStatus = await Campaigns.query()
        .update({
          status: statusActive,
          fromDate: currentDate,
        })
        .where("id", campaignId)
        .andWhere("status", "ready");

      const product = await Campaigns.query()
        .select("productId", "code")
        .where("id", campaignId)
        .first();

      const updateProductStatus = await Products.query()
        .update({
          status: "incampaign",
        })
        .where("id", product.productId);
      const supplierId: any = Products.query()
        .select("categories.supplierId")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", product.productId);

      const accountCustomer: any = await Customers.query()
        .select("customers.accountId")
        .join("loyalCustomers", "loyalCustomers.customerId", "customers.id")
        .where("loyalCustomers.supplierId", supplierId);

      const customerAccountIds = accountCustomer.map(
        (item: any) => item.accountId
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
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];
      const campaign: any = await Campaigns.query()
        .select(
          ...dbEntity.campaignEntity,
          ...listEntity,
          'categories.supplierId',
          Campaigns.raw(`
          sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join("products", "campaigns.productId", "products.id")
        .join('categories', 'categories.id', 'products.categoryId')
        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .where("campaigns.description", "like", "%" + value + "%")
        .orWhere("campaigns.code", "like", "%" + value + "%")
        .andWhere((cd) => {
          cd.where("campaigns.status", "active").orWhere(
            "campaigns.status",
            "ready"
          );
        })
        .groupBy("campaigns.id")
        .groupBy("products.id")
        .groupBy('categories.supplierId')

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
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
      ];
      const campaignList: any = await Campaigns.query()
        .select(
          ...dbEntity.campaignEntity,
          ...listEntity,
          Campaigns.raw(`
          sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join("products", "campaigns.productId", "products.id")
        .leftJoin("campaignOrders", "campaigns.id", "campaignOrders.campaignId")
        .where("campaigns.toDate", "<", value)
        .andWhere("campaigns.status", "active")
        .groupBy("campaigns.id")
        .groupBy("products.id");

      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignId as campaignid,",
          CampaignOrder.raw("SUM(quantity) as totalQuantity")
        )
        .where("status", "advanced")
        .groupBy("campaignId");

      for (const item of orderCampaign) {
        let campaign: any = await Campaigns.query()
          .select(
            ...dbEntity.campaignEntity,
            Campaigns.raw(`
          sum(case when "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced' then "campaignOrders".quantity else 0 end) as quantityorderwaiting,
            count("campaignOrders".id) filter (where "campaignOrders".status <> 'cancelled' and "campaignOrders".status <> 'returned' and "campaignOrders".status <> 'notAdvanced') as numorderwaiting
          `)
          )
          .join("products", `"campaigns"."productId"`, "products.id")
          .leftJoin(
            "campaignOrders",
            "campaigns.id",
            "campaignOrders.campaignId"
          )
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
      let { campaignId } = req.body;
      // let campaign = null;
      const campaign = await Campaigns.query()
        .select()
        .where("id", campaignId)
        .andWhere("status", "active")
        .first();
      if (campaign === undefined) {
        return res.status(200).send({
          message: "Campaign not found",
        });
      }
      const ordersInCampaign: any = await CampaignOrder.query()
        .select()
        .where("campaignId", campaignId)
        .andWhere("status", "advanced");

      if (ordersInCampaign) {
        const orderId = ordersInCampaign.map((item: any) => item.id);
        await Promise.all([
          CampaignOrder.query()
            .update({
              status: "unpaid",
            })
            .whereIn("id", orderId)
            .andWhere("paymentMethod", "online"),
          CampaignOrder.query()
            .update({
              status: "created",
            })
            .whereIn("id", orderId)
            .andWhere("paymentMethod", "cod"),
        ]);

        await Campaigns.query()
          .update({ status: "done" })
          .where("id", campaignId);
        const getCampaigns = await Campaigns.query()
          .select()
          .where("productId", campaign.productId)
          .andWhere("status", "active");

        if (getCampaigns.length === 0) {
          await Products.query()
            .update({ status: "active" })
            .where("id", campaign.productId);
        }

        for (const item of ordersInCampaign) {
          orderStatusHistoryController.createHistory({
            orderStatus: item.paymentMethod === "online" ? "unpaid" : "created",
            type: "campaign",
            campaignOrderId: item.id,
            orderCode: item.orderCode,
            description:
              item.paymentMethod === "online"
                ? "requires full payment via VNPAY E-Wallet"
                : "is created",
          } as OrderStatusHistory);

          const customer = await Customers.query()
            .select()
            .where("id", item.customerid)
            .first();

          if (item.paymentMethod === "online") {
            notif.sendNotiForWeb({
              userId: customer.accountId,
              link: item.orderCode,
              message: "Order " + item.orderCode + "has been set to unpaid",
              status: "unread",
            });
          } else {
            notif.sendNotiForWeb({
              userId: customer.accountId,
              link: item.orderCode,
              message: "Order " + item.orderCode + "has been set to created",
              status: "unread",
            });
          }

          //update quantity of product
          await Products.query()
            .update({
              quantity: Products.raw(`quantity - ${item.quantity}`),
            })
            .where("id", campaign.productId);
        }
        // let supplierId;
        // supplierId = await Suppliers.query()
        //   .select()
        // .where("id", campaign.supplierId)
        //   .first();
        // notif.sendNotiForWeb({
        //   userid: supplierId.accountId,
        //   link: campaign.code,
        //   message: `Campaign with code: ${campaign.code} has ended`,
        //   status: "unread",
        // });
      }
      return res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new Campaign();
