import { Products } from "../models/products";
import console from "console";
import { Suppliers } from "../models/suppliers";
import { Categories } from "../models/category";
import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import notif from "../services/realtime/notification";
import { Order } from "../models/orders";
import { Customers } from "../models/customers";
import orderStatusHistoryController from "./orderStatusHistoryController";
import { OrderStatusHistory } from "../models/orderstatushistory";
import transactionController from "./transaction";
import { Transaction } from "objection";
import { OrderDetail } from "../models/orderdetail";
import moment from "moment";
import dbEntity from "../services/dbEntity";

class ProductsController {
  public createNewProduct = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.user.id; //supplierid
      // console.log(supplierId)
      let {
        name,
        retailPrice,
        quantity,
        description = "",
        image = "",
        categoryId,
        status = "active",
        weight
      } = req.body;

      const prod: any = await Products.query().insert({
        name: name,
        retailPrice: retailPrice,
        quantity: quantity,
        // supplierId: supplierId,
        description: description,
        image: JSON.stringify(image),
        categoryId: categoryId,
        status: status,
        weight: weight
      });
      return res.status(200).send({
        message: "successful",
        data: prod,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public updateProduct = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      let { name, retailPrice, quantity, description, image, categoryId, weight } =
        req.body;

      const productUpdated: any = await Products.query()
        .update({
          name: name,
          retailPrice: retailPrice,
          categoryId: categoryId,
          quantity: quantity,
          description: description,
          image: JSON.stringify(image),
          weight: weight
        })
        .where("id", productId);
      // .andWhere("status", "<>", "incampaign");

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

      return res.status(400).send({ message: error });
    }
  };

  public activeProduct = async (req: any, res: any) => {
    try {
      const productId = req.body.productId;

      const update = await Products.query()
        .select()
        .update({
          status: "active",
        })
        .where("id", productId)
        .first();

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllProductAndSupplierInformation = async (req: any, res: any) => {
    try {
      const supplierId = req.query.supplierId;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const List = supplierId
        ? await Categories.query()
          .select(...dbEntity.productEntity, ...ListSupplierEntity)
          .join("suppliers", "suppliers.id", "categories.supplierId")
          .join("products", "products.categoryiId", "categories.id")
          .where("products.status", "<>", "deactivated")
          .andWhere("categories.supplierId", supplierId)
        : await Categories.query()
          .select(...dbEntity.productEntity, ...ListSupplierEntity)
          .join("suppliers", "suppliers.id", "categories.supplierId")
          .join("products", "products.categoryId", "categories.id")
          .where("products.status", "<>", "deactivated");

      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllProductsAndCates = async (req: any, res: any, next: any) => {
    try {
      let listEntity = [
        ...dbEntity.productEntity,
        "categories.categoryName as categoryname",
        "categories.id as categoryid",
      ];
      let prods: any = await Products.query()
        .select(...listEntity)
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        // .where("products.status", "<>", "deactivated")
        .where("categories.supplierId", req.user.id)
        .andWhere((cd) => {
          if (req.query.categoryId) {
            cd.where("categories.id", req.query.categoryId);
          }
        });

      // for (const prod of prods) {
      //   const totalMaxQuantity: any = (await Campaigns.query()
      //     .select()
      //     .sum("maxquantity")
      //     .where("productid", prod.id)
      //     .groupBy("campaigns.id")
      //     .first()) || { sum: 0 };

      //   prod.maxquantity = totalMaxQuantity.sum;
      // }

      return res.status(200).send({
        message: "get success",
        data: prods,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllProductsBySupplierId = async (req: any, res: any, next: any) => {
    try {
      let listEntity = [
        ...dbEntity.productEntity
      ];
      let supplierEntity = [
        "suppliers.id as supplierid",
        "suppliers.name as suppliername",
        "suppliers.address as supplieraddress",

      ];
      const supplierId = req.params.supplierId;
      const supplierData = await Suppliers.query().select(...supplierEntity).where('id', supplierId).first();
      let prods: any = await Products.query()
        .select(...listEntity)
        .join('categories', 'categories.id', 'products.categoryId')
        .where('categories.supplierId', supplierId)
        .andWhere('products.status', '<>', 'deactivated');
      for (let item of prods) {

        Object.assign(item, { ...item, ...supplierData })
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
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const data = await Categories.query()
        .select(...dbEntity.productEntity, ...listEntity)
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
      return res.status(400).send({ message: error });
    }
  };

  //supplier  or inspector can do it
  public disableProduct = async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      const reasonUpdate = req.body.reasonUpdate;


      await Products.query()
        .update({
          status: "deactivated",
          reasonUpdate: req.user.rolename + ": " + reasonUpdate
        })
        .where("id", productId);


      const inCampaignByProductId: any = await Campaigns.query()
        .select()
        .where("productId", productId)
        .andWhere((cd) => {
          cd.where("status", "ready").orWhere("status", "active");
        });

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
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .where("orderDetails.productId", productId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid");
        });

      const orderCampaign: any = await CampaignOrder.query()
        .select()
        .join('campaigns', 'campaignOrders.campaignId', 'campaigns.id')
        .where("campaigns.productId", productId)
        .andWhere((cd) => {
          cd.where("campaignOrders.status", "advanced")
            .orWhere("campaignOrders.status", "created")
            .orWhere("campaignOrders.status", "unpaid");
        });
console.log(orderCampaign.length)
console.log(orderCampaign)
      //send notif for customer for retail
      if (orderRetail.length > 0) {
        for (const item of orderRetail) {
          await Order.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const cusAccountId = await Customers.query()
            .select("accountId")
            .where("id", item.customerId)
            .first();
          notif.sendNotiForWeb({
            userId: cusAccountId.accountId,
            link: item.orderCode,
            message:
              "Order " +
              item.orderCode +
              " has been cancelled because the product has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            orderStatus: "cancelled",
            type: "retail",
            retailOrderId: item.id,
            // image: JSON.stringify(image),
            orderCode: item.orderCode,
            description: "has been cancelled for: product has been disabled",
          } as OrderStatusHistory);
        }
      }

      //send notif for customer for campaign
      if (orderCampaign.length > 0) {
        for (const item of orderCampaign) {
          await CampaignOrder.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const cusAccountId = await Customers.query()
            .select("accountId")
            .where("id", item.customerId)
            .first();

          notif.sendNotiForWeb({
            userId: cusAccountId.accountId,
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
            // image: JSON.stringify(image),
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

      //send notif for supp abt
      const suppAccountId = await Suppliers.query()
        .select("accountId")
        .where("id", suppId.supplierId)
        .first();

      notif.sendNotiForWeb({
        userId: suppAccountId.accountId,
        link: productId,
        message:
          "Product and its related campaigns and orders have been cancelled",
        status: "unread",
      });

      transactionController.createTransaction({
        ordercode: null,
        iswithdrawable: false,
        type: "penalty",
        supplierid: suppId.supplierId,
      } as Transaction);

      return res.status(200).send({
        message: "Delete Success",
        data: null,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
      return res.status(400).send({ message: error });
    }
  };

  public getRatingByListProducts = async (req: any, res: any, next: any) => {
    try {
      const productIds = req.body.productIds;
      const nullValue = "";
      const campaignOrder: any = await CampaignOrder.query()
        .select(
          "campaigns.productId",
          CampaignOrder.raw(`coalesce(COUNT("campaignOrders".id),0) as count`),
          CampaignOrder.raw(
            `coalesce(SUM ("campaignOrders".rating),0) AS rating`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .whereIn("campaigns.productId", productIds)
        .andWhere("campaignOrders.comment", "<>", nullValue)
        .groupBy("campaigns.productId");

      const retailOrder: any = await OrderDetail.query()
        .select(
          "orderDetails.productId",
          OrderDetail.raw(`coalesce(COUNT("orderDetails".id),0) as count`),
          OrderDetail.raw(`coalesce(SUM (rating),0) AS rating`)
        )
        .whereIn("orderDetails.productId", productIds)
        .andWhere("orderDetails.comment", "<>", nullValue)
        .groupBy("orderDetails.productId");

      // const listRating = await Comments.query()
      //   .select("productid", Comments.raw(`AVG(rating) as rating`))
      //   .whereIn("productid", productIds)
      //   .groupBy("productid");
      return res.status(200).send({
        message: "successful",
        data: { campaignOrder: campaignOrder, retailOrder: retailOrder },
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
      return res.status(400).send({ message: error });
    }
  };

  public getListProductByCates = async (req: any, res: any, next: any) => {
    try {
      let supplierEntity = [
        "suppliers.id as supplierid",
        "suppliers.name as suppliername",
        "suppliers.address as supplieraddress",

      ];

      const listCategories = req.body.listCategories;
      // console.log(listCategories)
      const data: any = await Products.query()
        .select(...dbEntity.productEntity)
        .whereIn("categoryId", listCategories)
        .andWhere("status", "<>", "deactivated");
      for (let item of data) {
        const supplier = await Suppliers.query().select(...supplierEntity)
          .join('categories', 'categories.supplierId', 'suppliers.id')
          .where('categories.id', item.categoryid).first();
        Object.assign(item, { ...item, ...supplier })
      }
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllProdWithCampaignStatus = async (req: any, res: any) => {
    try {
      const campaignStatus = req.body.campaignStatus;
      console.log(campaignStatus);
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const products = await Campaigns.query()
        .select("productId")
        .where("status", campaignStatus)
        .groupBy("productId");
      const productIds = products.map((item: any) => item.productid);

      const List = await Products.query()
        .select(dbEntity.productEntity, ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryId")
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .whereIn("products.id", productIds)
        .where("products.status", "<>", "deactivated");
      // .groupBy('products.id')
      // .groupBy('supplier.id')

      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getProductWithOrderCompleted = async (req: any, res: any) => {
    try {
      const status = "completed";
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
      let productIdOrder: any = await Order.query()
        .select("orderDetails.productId as productid")
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .where("orders.status", status)
        .groupBy("orderDetails.productId");

      let productIdCampaign = await CampaignOrder.query()
        .select("campaigns.productId as productid")
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .where("campaignOrders.status", status)
        .groupBy("campaigns.productId");
      productIdCampaign.push(...productIdOrder);

      productIdCampaign = [
        ...new Map(
          productIdCampaign.map((item: any) => [item["productid"], item])
        ).values(),
      ];
      const productIds = productIdCampaign.map((item: any) => item.productid);

      const List = await Products.query()
        .select(...dbEntity.productEntity, ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryId")
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .whereIn("products.id", productIds)
        .where("products.status", "<>", "deactivated");

      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllProductByStatus = async (req: any, res: any) => {
    try {
      const status = req.body.status;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const data = await Products.query()
        .select(...ListSupplierEntity, ...dbEntity.productEntity)
        .join("categories", "categories.id", "products.categoryId")
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .where("status", status);
      console.log(data)

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getProductCreatedThisWeek = async (req: any, res: any) => {
    try {
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountId as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isDeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      var sunday = moment().startOf("week");
      var saturday = moment().endOf("week");
      console.log(sunday)
      console.log(saturday)

      const data = await Products.query()
        .select(...dbEntity.productEntity, ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryId")
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .whereBetween("products.createdAt", [sunday, saturday])
        .andWhere("products.status", "<>", "deactivated");
      console.log(data);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}

export default new ProductsController();
