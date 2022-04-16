import { Products } from "../models/products";
import console from "console";
import { Suppliers } from "../models/suppliers";
import { Comments } from "../models/comment";
import { rmSync } from "fs";
import { any } from "joi";
import { Categories } from "../models/category";
import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import notif from "../services/realtime/notification";
import { Order } from "../models/orders";
import { Accounts } from "../models/accounts";
import { Customers } from "../models/customers";
import orderStatusHistoryController from "./orderStatusHistoryController";
import { OrderStatusHistory } from "../models/orderstatushistory";
import transactionController from "./transaction";
import { Transaction } from "objection";
import { OrderDetail } from "../models/orderdetail";
import moment from "moment";



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
      } = req.body;

      const prod: any = await Products.query().insert({
        name: name,
        retailprice: retailPrice,
        quantity: quantity,
        supplierid: supplierId,
        description: description,
        image: JSON.stringify(image),
        categoryid: categoryId,
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
          retailprice: retailPrice,
          categoryid: categoryId,
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
  ) => {
    try {
      const supplierId = req.query.supplierId;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const List = supplierId
        ? await Categories.query()
          .select("products.*", ...ListSupplierEntity)
          .join("suppliers", "suppliers.id", "categories.supplierid")
          .join("products", "products.categoryid", "categories.id")
          .where("products.status", "<>", "deactivated")
          .andWhere("categories.supplierid", supplierId)
        : await Categories.query()
          .select("products.*", ...ListSupplierEntity)
          .join("suppliers", "suppliers.id", "categories.supplierid")
          .join("products", "products.categoryid", "categories.id")
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
        "categories.categoryname as categoryname",
        "categories.id as categoryid",
      ];
      let prods: any = await Products.query()
        .select(...listEntity)
        .leftOuterJoin("categories", "categories.id", "products.categoryid")
        .where("products.status", "<>", "deactivated")
        .andWhere("categories.supplierid", req.user.id);

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

  // public getAllProductsBySupplierId = async (req: any, res: any, next: any) => {
  //   try {
  //     let listEntity = [
  //       "products.*",
  //       // "categories.categoryname as categoryname",
  //       // "categories.id as categoryid",
  //     ];
  //     const supplierId = req.query.supplierId;

  //     let prods = await Products.query()
  //       .select(...listEntity)
  //       // .leftOuterJoin("categories", "categories.id", "products.categoryid")
  //       // .where("products.status", "<>", "deactivated")
  //       .where("products.supplierid", supplierId);

  //     prods = prods.map((prod: any) => {
  //       if (prod.image) {
  //         console.log(prod.image);
  //         // prod.image = JSON.parse(prod.image);
  //       }
  //       return prod;
  //     });
  //     // console.log('test')
  //     return res.status(200).send({
  //       message: "get success",
  //       data: prods,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  public getProductById = async (req: any, res: any, next: any) => {
    try {
      // console.log('testtt')
      const { productId } = req.params;
      const listEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const data = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join("products", "products.categoryid", "categories.id")
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

  //supplier  or inspector can do it
  public disableProduct = async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      await Products.query()
        .update({
          status: "deactivated",
        })
        .where("id", productId)

      const inCampaignByProductId: any = await Campaigns.query().select()
        .where("productid", productId)
      // .andWhere((cd) => {
      //   cd.where("status", "ready")
      //     .orWhere("status", "active")
      // })

      if (inCampaignByProductId.length > 0) {
        for (const item of inCampaignByProductId) {
          await Campaigns.query().update({
            status: "stopped",
          })
            .where('id', item.id);
        }
      }

      const orderRetail: any = await Order.query().select()
        .join('orderdetail', 'orders.id', 'orderdetail.orderid')
        .where('orderdetail.productid', productId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid")
        })

      const orderCampaign: any = await CampaignOrder.query().select()
        .where('productid', productId)
        .andWhere((cd) => {
          cd.where("status", "advanced")
            .orWhere("status", "created")
            .orWhere("status", "unpaid")
        })

      //send notif for customer for retail
      if (orderRetail.length > 0) {
        for (const item of orderRetail) {
          await Order.query().update({
            status: "cancelled",
          })
            .where('id', item.id);
          const cusAccountId = await Customers.query().select('accountid').where('id', item.customerid).first();
          notif.sendNotiForWeb({
            userid: cusAccountId.accountid,
            link: item.ordercode,
            message: "Order " + item.ordercode + " has been cancelled because the product has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            statushistory: 'cancelled',
            type: 'retail',
            retailorderid: item.id,
            // image: JSON.stringify(image),
            ordercode: item.ordercode,
            description: "has been cancelled for: product has been disabled",
          } as OrderStatusHistory);
        }
      }

      //send notif for customer for campaign
      if (orderCampaign.length > 0) {
        for (const item of orderCampaign) {
          await CampaignOrder.query().update({
            status: "cancelled",
          })
            .where('id', item.id);
          const cusAccountId = await Customers.query().select('accountid').where('id', item.customerid).first();

          notif.sendNotiForWeb({
            userid: cusAccountId.accountid,
            link: item.ordercode,
            message: "Order " + item.ordercode + " has been cancelled because the product has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            statushistory: 'cancelled',
            type: "campaign",
            campaignorderid: item.id,
            // image: JSON.stringify(image),
            ordercode: item.ordercode,
            description: "has been cancelled for: product has been disabled",
          } as OrderStatusHistory);
        }
      }

      const suppId: any = await Products.query().select('categories.supplierid')
        .join('categories', "categories.id", "products.categoryid")
        .where('products.id', productId).first();

      //send notif for supp abt
      const suppAccountId = await Suppliers.query().select('accountid').where('id', suppId.supplierid).first();

      notif.sendNotiForWeb({
        userid: suppAccountId.accountid,
        link: productId,
        message: 'Product and its related campaigns and orders have been cancelled',
        status: "unread",
      });

      transactionController.createTransaction({
        ordercode: null,
        iswithdrawable: false,
        type: "penalty",
        supplierid: suppId.supplierid
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

      const update = await Products.query().update({
        status: 'active',
      })
        .where('status', 'deactivated')
        .andWhere('id', productId).first();

      return res.status(200).send({
        message: " successful",
        data: update
      })
    } catch (error) {
      console.log(error)
    }
  }

  public getRatingByListProducts = async (req: any, res: any, next: any) => {
    try {
      const productIds = req.body.productIds;
      const nullValue = '';
      const campaignOrder: any = await CampaignOrder.query()
        .select('campaignorder.productid',
          CampaignOrder.raw('COUNT(campaignorder.id) as count'),
          CampaignOrder.raw(`SUM (rating) AS rating`)
        )
        .whereIn('campaignorder.productid', productIds)
        .andWhere('campaignorder.comment', "<>", nullValue)
        .groupBy('productid');

      const retailOrder: any = await OrderDetail.query()
        .select('orderdetail.productid',
          OrderDetail.raw('COUNT(orderdetail.id) as count'),
          OrderDetail.raw(`SUM (rating) AS rating`)
        )
        .whereIn('orderdetail.productid', productIds)
        .andWhere('orderdetail.comment', "<>", nullValue)
        .groupBy('productid');

      // const listRating = await Comments.query()
      //   .select("productid", Comments.raw(`AVG(rating) as rating`))
      //   .whereIn("productid", productIds)
      //   .groupBy("productid");
      return res.status(200).send({
        message: "successful",
        data: ({ campaignOrder: campaignOrder, retailOrder: retailOrder }),
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
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const prod: any = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join("products", "products.categoryid", "categories.id")
        .where("products.name", "like", "%" + value + "%")
        .orWhere("suppliers.name", "like", "%" + value + "%")
        .andWhere("products.status", "<>", "deactivated");

      // await Categories.query()
      //   .select("products.*", ...listEntity)
      //   .join("suppliers", "suppliers.id", "categories.supplierid")
      //   .join('products', 'products.categoryid', 'categories.id')
      //   .where("products.name", 'like', '%' + value + '%')
      //   .orWhere('suppliers.name', 'like', '%' + value + '%')
      //   .andWhere("products.status", "<>", "deactivated")

      // console.log(prod);
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
      // console.log(listCategories)
      const data: any = await Products.query()
        .select()
        .whereIn("categoryid", listCategories)
        // .andWhere('status', 'active')
        // .andWhere('status', 'incampaign')
        .andWhere("status", "<>", "deactivated");
      // console.log('test')
      // console.log(data)
      // if (data === '' || data === null) {
      //   return res.status(200).send('no product found')
      // }
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProdWithCampaignStatus = async (req: any, res: any) => {
    try {
      const campaignStatus = req.body.campaignStatus;
      console.log(campaignStatus)
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const products = await Campaigns.query().select('productid').where('status', campaignStatus).groupBy('productid');
      const productIds = products.map((item: any) => item.productid);

      const List = await Products.query()
        .select("products.*", ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryid")
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .whereIn('products.id', productIds)
        .where('products.status', '<>', 'deactivated')
      // .groupBy('products.id')
      // .groupBy('supplier.id')


      return res.status(200).send({
        message: 'successful',
        data: List
      })
    } catch (error) {
      console.log(error)
    }
  };

  public getProductWithOrderCompleted = async (req: any, res: any) => {
    try {
      const status = 'completed';
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      let productIdOrder: any = await Order.query().select('orderdetail.productid')
        .join('orderdetail', 'orders.id', "orderdetail.orderid")
        .where('orders.status', status).groupBy('orderdetail.productid');

      let productIdCampaign = await CampaignOrder.query().select('productid').where('campaignorder.status', status).groupBy('productid');
      productIdCampaign.push(...productIdOrder)

      productIdCampaign = [...new Map(productIdCampaign.map((item: any) => [item['productid'], item])).values()]
      const productIds = productIdCampaign.map((item: any) => item.productid);

      const List = await Products.query()
        .select("products.*", ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryid")
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .whereIn('products.id', productIds)
        .where('products.status', '<>', 'deactivated')

      return res.status(200).send({
        message: 'successful',
        data: List
      })
    } catch (error) {
      console.log(error)
    }
  };

  public getAllProductByStatus = async (req: any, res: any) => {
    try {
      const status = req.body.status;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const data = await Products.query().select(...ListSupplierEntity, 'products.*')
        .join("categories", "categories.id", "products.categoryid")
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .where('status', status)

      return res.status(200).send({
        message: 'successful',
        data: data
      })
    } catch (error) {
      console.log(error)
    }
  };

  public getProductCreatedThisWeek = async (req: any, res: any) => {
    try {
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      var now = moment();
      var monday = now.clone().weekday(1);
      var sunday = now.clone().weekday(7);
      // var isNowWeekday = now.isBetween(monday, friday, null, '[]');

      // console.log(`now: ${now}`);
      // console.log(`monday: ${monday}`);
      // console.log(`sunday: ${sunday}`);
      const data = await Products.query().select('products.*', ...ListSupplierEntity)
        .join("categories", "categories.id", "products.categoryid")
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .whereBetween("products.createdat", [monday, sunday])
        .andWhere('products.status', '<>', 'deactivated')
      if (monday && sunday) {
        return res.status(200).send({
          message: 'successful',
          data: data 
        })
      }
    } catch (error) {
      console.log(error)
    }
  };

  public getAllProductCreatedByEveryMonth = async (req: any, res: any) => {
    try {
      console.log('testttt')
      const query = ` SELECT
                      DATE_TRUNC('month', "createdat") AS "month",
                      COUNT(*)
                      FROM "events"
                      GROUP BY DATE_TRUNC('month', "event_timestamp")`;

      const data= await Products.raw(query);
      console.log(data)

      return res.status(200).send({
        message: 'successful',
        data: data
      })

    } catch (error) {
      console.log(error)
    }
  }
}

export default new ProductsController();
