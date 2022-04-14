import { Campaigns } from "../models/campaigns";
import knex from "knex";
import { Products } from "../models/products";
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";
import moment from "moment";

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
        description
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
          description: description
        });

        // await Products.query()
        //   .update({
        //     status: "incampaign",
        //   })
        //   .where("id", productId);

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
          // .andWhere("fromdate", ">=", Campaigns.raw("now()"))
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

  //TODO
  async getAllCampaigns(req: any, res: any, next: any) {
    try {
      const supplierId = req.query.supplierId;
      // let listEntityies = ["sum(orders.quantity) as quantityOrderWaiting"];

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
          // .andWhere("campaigns.status", "active")
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
          // .leftJoin("orderdetail", "orders.id", "orderdetail.orderid")
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

  //TODO
  async getAllCampaignsAllowProductId(req: any, res: any, next: any) {
    try {
      const productIds = req.body.productIds;
      const { status = "active" } = req.body;

      const campaigns = await Campaigns.query()
        .select(
          "campaigns.*",
          Campaigns.raw(
            `sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting`
          )
        )
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        // .leftJoin("orderdetail", "campaignorder.id", "orderdetail.campaignorder")
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

  //TODO
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

  //TODO
  public getOneCampaignByCampaignId = async (req: any, res: any, next: any) => {
    try {
      const campaignId = req.params.campaignId;

      const campaign: any = await Campaigns.query()
        .select(
          "campaigns.*",
          // 'products.name as productname',
          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )
        // .join('products', 'campaigns.productid', 'products.id')
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
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

  public changeStatusToActive = async (req: any, res: any) => {
    try {
      const { campaignId } = req.body;
      const statusActive = 'active';
      // console.log(campaignId)
      const updateCampaignStatus = await Campaigns.query().update({
        status: statusActive,
      })
        .where('id', campaignId)
        .andWhere('status', 'ready');
      // console.log(updateCampaignStatus)

      const product = await Campaigns.query().select('productid', 'code').where('id', campaignId).first();
      // console.log(product)
      const updateProductStatus = await Products.query().update({
        status: 'incampaign',
      })
        .where('id', product.productid);
      const supplierId: any = Products.query().select('categories.supplierid')
        .join("categories", "categories.id", "products.categoryid")
        .where('products.id', product.productid);

      const accountCustomer: any = await Customers.query().select('customers.accountid')
        .join('loyalcustomer', 'loyalcustomer.customerid', 'customers.id')
        .where('loyalcustomer.supplierid', supplierId);
      // console.log(accountCustomer)
      const customerAccountIds = accountCustomer.map((item: any) => item.accountid);

      //send notif for customer who buy products in campaign
      for (const item of customerAccountIds) {
        notif.sendNotiForWeb({
          userid: item,
          link: campaignId, //campaign id
          message: "campaign with code: " + product.code + " has started",
          status: "unread",
        });
      }


      return res.status(200).send({
        message: 'successful',
        data: ({
          updateProdStatus: updateProductStatus,
          updateCampaignStatus: updateCampaignStatus
        })
      })
    } catch (error) {
      console.log(error)
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
          "campaigns.*", ...listEntity,
          // 'products.name as productname',
          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join('products', 'campaigns.productid', 'products.id')
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        .where("campaigns.description", "like", "%" + value + "%")
        .orWhere("campaigns.code", "like", "%" + value + "%")
        .andWhere((cd) => {
          cd.where("campaigns.status", 'active')
            .orWhere("campaigns.status", 'ready')
        })
        .groupBy("campaigns.id")
        .groupBy("products.id");

      return res.status(200).send({
        message: 'successful',
        data: campaign
      })
    }
    catch (error) {
      console.log(error)
    }
  };

  public getEndingCampaignList = async (req: any, res: any) => {
    try {
      const value = moment().add(3, 'days').toDate();
      console.log(value)
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
          "campaigns.*", ...listEntity,
          // 'products.name as productname',
          Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
        )
        .join('products', 'campaigns.productid', 'products.id')
        .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
        .where("campaigns.todate", "<", value)
        .andWhere("campaigns.status", 'active')
        .groupBy("campaigns.id")
        .groupBy("products.id")



      const orderCampaign: any = await CampaignOrder.query().select('campaignid',
        CampaignOrder.raw('SUM(quantity) as totalQuantity'))
        .where('status', 'advanced').groupBy('campaignid')

      for (const item of orderCampaign) {
        let campaign: any = await Campaigns.query()
          .select(
            "campaigns.*",
            Campaigns.raw(`
          sum(case when campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced' then campaignorder.quantity else 0 end) as quantityorderwaiting,
            count(campaignorder.id) filter (where campaignorder.status <> 'cancelled' and campaignorder.status <> 'returned' and campaignorder.status <> 'notAdvanced') as numorderwaiting
          `)
          )
          .join('products', 'campaigns.productid', 'products.id')
          .leftJoin("campaignorder", "campaigns.id", "campaignorder.campaignid")
          .where('id', item.campaignid).first();
        console.log(((campaign.quantity * 0.8) as Number) < item['totalQuantity']) // -> so sánh đc
        if (((campaign.quantity * 0.8) as Number) < item['totalQuantity']) {
          /*  
          TODO
          so sánh số lượng đã order (item['totalQuantity'])  và minQuantity của campaign
          nếu như số lượng order >= 80% minQuantity thì add campaign vào campaignList (line 453)

          */
          campaignList.push(campaign)
        }
      }
      //TODO
      // next step: delete duplicate campaign list


      return res.status(200).send({
        message: 'successful',
        data: campaignList
      })
    } catch (error) {
      console.log(error)
    }

  }
}

export default new Campaign();
