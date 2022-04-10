import { Transaction } from "objection";
import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import { Categories } from "../models/category";
import { Customers } from "../models/customers";
import { OrderDetail } from "../models/orderdetail";
import { Order } from "../models/orders";
import { OrderStatusHistory } from "../models/orderstatushistory";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import notif from "../services/realtime/notification";
import orderStatusHistoryController from "./orderStatusHistoryController";
import transactionController from "./transaction";

class ProductsController {
  public createNewProduct = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.user.id;

      let {
        name,
        retailPrice,
        quantity,
        description = "",
        image = "",
        categoryId,
        status = "active",
      } = req.body;

      const prod: any = await Products.query().insert({
        name: name,
        retailPrice: retailPrice,
        quantity: quantity,

        description: description,
        image: JSON.stringify(image),
        categoryId: categoryId,
        status: status,
      });
      return res.status(200).send({
        message: "successful",
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateProduct = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      let { name, retailPrice, quantity, description, image, categoryId } =
        req.body;

      const productUpdated: any = await Products.query()
        .update({
          name: name,
          retailPrice: retailPrice,
          categoryId: categoryId,
          quantity: quantity,
          description: description,
          image: JSON.stringify(image),
        })
        .where("id", productId)
        .andWhere("status", "<>", "incampaign");

      if (productUpdated === 0) {
        return res.status(200).send({
          message: "update failed",
          data: 0,
        });
      }
      return res.status(200).send({
        message: "updated product: " + name,
        data: productUpdated,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProductAndSupplierInformation = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const supplierId = req.query.supplierId;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremail",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      let List = supplierId
        ? await Categories.query()
            .select("products.*", ...ListSupplierEntity)
            .join("suppliers", "suppliers.id", "categories.supplierId")
            .join("products", "products.categoryId", "categories.id")
            .where("products.status", "<>", "deactivated")
            .andWhere("categories.supplierId", supplierId)
        : await Categories.query()
            .select("products.*", ...ListSupplierEntity)
            .join("suppliers", "suppliers.id", "categories.supplierId")
            .join("products", "products.categoryId", "categories.id")
            .where("products.status", "<>", "deactivated");
      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProductsAndCates = async (req: any, res: any, next: any) => {
    try {
      let listEntity = [
        "products.*",
        "categories.categoryName as categoryname",
        "categories.id as categoryid",
      ];
      let prods: any = await Products.query()
        .select(...listEntity)
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        .where("products.status", "<>", "deactivated")
        .andWhere("categories.supplierId", req.user.id);

      for (const prod of prods) {
        const totalMaxQuantity: any = (await Campaigns.query()
          .select()
          .sum("maxquantity")
          .where("productid", prod.id)
          .groupBy("campaigns.id")
          .first()) || { sum: 0 };

        prod.maxquantity = totalMaxQuantity.sum;
      }

      return res.status(200).send({
        message: "get success",
        data: prods,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getProductById = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      const listEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremail",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const data = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .join("products", "products.categoryId", "categories.id")
        .where("products.id", productId)
        .first();

      console.log(data);
      return res.status(200).send({
        message: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public disableProduct = async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      await Products.query()
        .update({
          status: "deactivated",
        })
        .where("id", productId);

      const inCampaignByProductId: any = await Campaigns.query()
        .select()
        .where("productid", productId);

      if (inCampaignByProductId.length > 0) {
        for (const item of inCampaignByProductId) {
          await Campaigns.query()
            .update({
              status: "stopped",
            })
            .where("id", item.id);
        }
      }

      const orderRetail: any = await Order.query()
        .select()
        .join("orderDetail", "orders.id", "orderDetail.orderId")
        .where("orderDetail.productId", productId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid");
        });

      const orderCampaign: any = await CampaignOrder.query()
        .select()
        .where("productId", productId)
        .andWhere((cd) => {
          cd.where("status", "advanced")
            .orWhere("status", "created")
            .orWhere("status", "unpaid");
        });

      if (orderRetail.length > 0) {
        for (const item of orderRetail) {
          await Order.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const cusAccountId = await Customers.query()
            .select("accountId")
            .where("id", item.customerid)
            .first();
          notif.sendNotiForWeb({
            userid: cusAccountId.accountId,
            link: item.ordercode,
            message:
              "Order " +
              item.ordercode +
              " has been cancelled because the product has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            orderStatus: "cancelled",
            type: "retail",
            retailOrderId: item.id,

            orderCode: item.ordercode,
            description: "has been cancelled for: product has been disabled",
          } as OrderStatusHistory);
        }
      }

      if (orderCampaign.length > 0) {
        for (const item of orderCampaign) {
          await CampaignOrder.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const cusAccountId = await Customers.query()
            .select("accountId")
            .where("id", item.customerid)
            .first();

          notif.sendNotiForWeb({
            userid: cusAccountId.accountId,
            link: item.orderCode,
            message:
              "Order " +
              item.orderCode +
              " has been cancelled because the product has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            orderStatus: "cancelled",
            type: "campaign",
            campaignOrderId: item.id,

            orderCode: item.orderCode,
            description: "has been cancelled for: product has been disabled",
          } as OrderStatusHistory);
        }
      }

      const suppId: any = await Products.query()
        .select("categories.supplierId")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", productId)
        .first();

      const suppAccountId = await Suppliers.query()
        .select("accountId")
        .where("id", suppId.supplierid)
        .first();

      notif.sendNotiForWeb({
        userid: suppAccountId.accountId,
        link: productId,
        message:
          "Product and its related campaigns and orders have been cancelled",
        status: "unread",
      });

      transactionController.createTransaction({
        ordercode: null,
        iswithdrawable: false,
        type: "penalty",
        supplierid: suppId.supplierid,
      } as Transaction);

      return res.status(200).send({
        message: "Delete Success",
        data: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public activeProductById = async (req: any, res: any) => {
    try {
      const productId = req.body.productId;

      const update = await Products.query()
        .update({
          status: "active",
        })
        .where("status", "deactivated")
        .andWhere("id", productId)
        .first();

      return res.status(200).send({
        message: " successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getRatingByListProducts = async (req: any, res: any, next: any) => {
    try {
      const productIds = req.body.productIds;
      const nullValue = "";
      const campaignOrder: any = await CampaignOrder.query()
        .select(
          "campaignOrders.productId",
          CampaignOrder.raw("COUNT(campaignOrders.id) as count"),
          CampaignOrder.raw(`SUM (rating) AS rating`)
        )
        .whereIn("campaignOrders.productId", productIds)
        .andWhere("campaignOrders.comment", "<>", nullValue)
        .groupBy("productId");

      const retailOrder: any = await OrderDetail.query()
        .select(
          "orderDetails.productId",
          OrderDetail.raw("COUNT(orderDetails.id) as count"),
          OrderDetail.raw(`SUM (rating) AS rating`)
        )
        .whereIn("orderDetail.productId", productIds)
        .andWhere("orderDetail.comment", "<>", nullValue)
        .groupBy("productId");

      return res.status(200).send({
        message: "successful",
        data: { campaignOrder: campaignOrder, retailOrder: retailOrder },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public searchProduct = async (req: any, res: any, next: any) => {
    try {
      const value = req.body.value;
      const listEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const prod: any = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .join("products", "products.categoryId", "categories.id")
        .where("products.name", "like", "%" + value + "%")
        .orWhere("suppliers.name", "like", "%" + value + "%")
        .andWhere("products.status", "<>", "deactivated");

      return res.status(200).send({
        message: "success",
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getListProductByCates = async (req: any, res: any, next: any) => {
    try {
      const listCategories = req.body.listCategories;

      const data: any = await Products.query()
        .select()
        .whereIn("categoryId", listCategories)

        .andWhere("status", "<>", "deactivated");

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new ProductsController();
