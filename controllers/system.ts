import { Accounts } from "../models/accounts";
import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import { Categories } from "../models/category";
import { Customers } from "../models/customers";
import { Order } from "../models/orders";
import { OrderStatusHistory } from "../models/orderstatushistory";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import dbEntity from "../services/dbEntity";
import notif from "../services/realtime/notification";
import orderStatusHistoryController from "./orderStatusHistoryController";

class System {
  public getAllOrders = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const orders: any = await Order.query()
        .select(
          ...dbEntity.orderEntity,
          Order.raw(
            //TODO ORDER SUPPLIER ID
            `json_agg(to_jsonb("orderDetails") - 'orderId') as details`
          )
        )
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .where((cd) => {
          if (status) {
            cd.where("orders.status", status);
          }
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          ...dbEntity.campaignOrderEntity,
          CampaignOrder.raw(
            `array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', "image",
            'price', "campaignOrders"."price",
            'quantity', "campaignOrders"."quantity",
            'orderCode', "orderCode",
            'productId', "campaigns"."productId",
            'campaignId', "campaignId",
            'inCampaign', true,
            'customerId', "customerId",
            'totalPrice', "totalPrice",
            'productName', "campaigns"."productName",
            'notes', "campaignOrders"."note")
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .where((cd) => {
          if (status) {
            cd.where("campaignOrders.status", status);
          }
        })
        .groupBy("campaignOrders.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);

      for (const order of orders) {
        // console.log(order.details)

        const customer = await Customers.query()
          .select()
          .where("id", order.customerid)
          .first();
        order.customer = customer;
        const { supplierId }: any = await Products.query()
          .select("categories.supplierId")
          .join("categories", "categories.id", "products.categoryId")
          .where("products.id", order.details[0].productId)
          .first();
        const supplierData = await Suppliers.query().select(...dbEntity.supplierEntity, 'name as suppliername').where('id', supplierId).first();
        order.supplier = supplierData
      }
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public getAllCampaigns = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const listProductEntities = [
        "products.id as productid",
        "products.name as productname",
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
      ];
      const campaigns: any = await Campaigns.query()
        .select(...dbEntity.campaignEntity, ...listProductEntities)
        .join("products", "campaigns.productId", "products.id")
        .where((cd) => {
          if (status) {
            cd.where("campaigns.status", status);
          }
        });
      for (const element of campaigns) {
        const { supplierId }: any = await Products.query()
          .select("categories.supplierId")
          .join("categories", "categories.id", "products.categoryId")
          .where("products.id", element.productid)
          .first();
        const supplierData = await Suppliers.query().select(...dbEntity.supplierEntity, 'name as suppliername').where('id', supplierId).first();
        element.supplier = supplierData
      }
      return res.status(200).send({
        message: "successful",
        data: campaigns,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public getAllSupplier = async (req: any, res: any, next: any) => {
    try {
      const ListEntityAccount = [
        "accounts.roleId as roleid",
        "accounts.username as username",
        "accounts.googleId as googleid",
        "accounts.phone as phone",
        "accounts.isDeleted as accountisdeleted",
        "accounts.reasonForDisabling as reasonForDisabling",
        "accounts.reasonForEnabling as reasonForEnabling",

      ];

      const ListEntitysupplier = [
        "suppliers.id as id",
        "suppliers.accountId as accountid",
        "suppliers.name as name",
        "suppliers.email as email",
        "suppliers.avt as avt",
        "suppliers.isDeleted as isdeleted",
        "suppliers.createdAt as createdat",
        "suppliers.updatedAt as updatedat",
        "suppliers.address as address",
        "suppliers.identificationCard as identificationcard",
        "suppliers.identificationImage as identificationimage",
        "suppliers.eWalletCode as ewalletcode",
        "suppliers.eWalletSecret as ewalletsecret",
      ];
      const suppliername = req.query.supplierName;
      const suppliers = await Suppliers.query()
        .select(...ListEntitysupplier, ...ListEntityAccount, "accounts.reasonForDisabling", "accounts.reasonForEnabling")
        .join("accounts", "accounts.id", "suppliers.accountId")
        .where((cd) => {
          if (suppliername) {
            cd.where("name", "like", `%${suppliername}%`);
          }
        });
      return res.status(200).send({
        message: "successful",
        data: suppliers,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public getAllCustomer = async (req: any, res: any, next: any) => {
    try {
      const ListEntityCustomer = [
        "customers.id as id",
        "customers.firstName as fistname",
        "customers.lastName as lastname",
        "customers.email as email",
        "customers.avt as avt",
        "customers.isDeleted as customerisdeleted",
        "customers.createdAt as createdat",
        "customers.updatedAt as updatedat",
        "customers.eWalletCode as ewalletcode",
        "customers.eWalletSecret as ewalletsecret",
      ];
      const ListEntityAccount = [
        "accounts.roleId as roleid",
        "accounts.username as username",
        "accounts.googleId as googleid",
        "accounts.phone as phone",
        "accounts.isDeleted as accountisdeleted",
      ];

      const customername = req.query.customerName;
      const customers = await Customers.query()
        .select(...ListEntityAccount, ...ListEntityCustomer, ...dbEntity.adressEnityt, "accounts.reasonForDisabling", "accounts.reasonForEnabling")
        .join("accounts", "accounts.id", "customers.accountId")
        .join("addresses", "customers.id", "addresses.customerId")
        .where((cd) => {
          if (customername) {
            cd.where("firstname", "like", `%${customername}%`).orWhere(
              "lastname",
              "like",
              `%${customername}%`
            );
          }
        })
        .orderBy("customers.updatedAt", "desc");
        
      return res.status(200).send({
        message: "successful",
        data: customers,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public disableSupplier = async (req: any, res: any, next: any) => {
    try {
      const { supplierId } = req.body;
      const { reasonForDisabling } = req.body



      const products = await Products.query()
        .select("products.id")
        .join("categories", "products.categoryId", "categories.id")
        .where("categories.supplierId", supplierId)
        .andWhere("products.status", "<>", "deactivated");

      const campaign = await Campaigns.query()
        .select("campaigns.id")
        .join('products', 'campaigns.productId', 'products.id')
        .join('categories', 'categories.id', 'products.categoryId')
        .where("supplierId", supplierId)
        .andWhere((cd) => {
          cd.where("campaigns.status", "active").orWhere("campaigns.status", "ready");
        });

      const campaignIds = campaign.map((item: any) => item.id);
      const productIds = products.map((item: any) => item.id);

      const orders: any = await Order.query()
        .select()
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .whereIn("orderDetails.productId", productIds)
        .andWhere((cd) => {
          cd.where("orders.status", "processing")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid")
            .orWhere("orders.status", "advanced");
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select()
        .join('campaigns', 'campaignOrders.campaignId', 'campaigns.id')
        .whereIn("campaigns.productId", productIds)
        .andWhere((cd) => {
          cd.where("campaignOrders.status", "processing")
            .orWhere("campaignOrders.status", "created")
            .orWhere("campaignOrders.status", "unpaid")
            .orWhere("campaignOrders.status", "advanced");
        })
        .groupBy("campaignOrders.id");
      // 1. xoa order -> forof từng order và campaign order rồi cancel toàn bộ order của acc
      const statusCancelOrder = "cancelled";
      for (const item of orders) {
        await Order.query()
          .update({
            status: statusCancelOrder,
          })
          .where("id", item.id);
        const customer = await Customers.query()
          .select()
          .where("id", item.customerId)
          .first();
        notif.sendNotiForWeb({
          userId: customer.accountId,
          link: item.orderCode,
          message: "Order " + item.orderCode + " has been cancelled",
          status: "cancelled",
        });
        //type= retail
        orderStatusHistoryController.createHistory({
          orderStatus: "cancelled",
          type: "retail",
          retailOrderId: item.id,
          orderCode: item.orderCode,
          description:
            "has been cancelled by System for: System's account has been disabled",
        } as OrderStatusHistory);
      }

      for (const item of ordersInCampaign) {
        await CampaignOrder.query()
          .update({
            status: statusCancelOrder,
          })
          .where("id", item.id);
        const customer = await Customers.query()
          .select()
          .where("id", item.customerId)
          .first();
        notif.sendNotiForWeb({
          userId: customer.accountId,
          link: item.orderCode,
          message: "Order " + item.orderCode + " has been cancelled",
          status: "cancelled",
        });

        //type= campaign
        orderStatusHistoryController.createHistory({
          orderStatus: "cancelled",
          type: "campaign",
          campaignOrderId: item.id,
          orderCode: item.orderCode,
          description:
            "has been cancelled by System for: System's account has been disabled",
        } as OrderStatusHistory);
      }
      // //2. deactivate all campaign

      await Campaigns.query()
        .update({
          status: "stopped",
        })
        .whereIn("id", campaignIds);

      // //3. deactivate all prod
      // -- deacitve prod in Order table
      await Products.query()
        .update({
          status: "deactivated",
        })
        .whereIn("id", productIds);

      // // 4.  deactivate table account , supp account
      const deacitveSuppId = await Suppliers.query()
        .update({
          isDeleted: true,
        })
        .where("id", supplierId);
      const accountId = await Suppliers.query()
        .select("accountId")
        .where("id", supplierId)
        .first();
      const deactivatedAccount = await Accounts.query()
        .update({
          isDeleted: true,
          reasonForDisabling: reasonForDisabling
        })
        .where("id", accountId.accountId);

      return res.status(200).send({
        message: "successful",
        data: {
          deactivatedAccount: deactivatedAccount,
          deacitveSuppId: deacitveSuppId,
        },
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public disableCustomer = async (req: any, res: any) => {
    try {
      const customerId = req.body.customerId;
      const reasonForDisabling = req.body.reasonForDisabling;
      const orderRetail: any = await Order.query()
        .select("orders.id", "categories.supplierId", "orders.orderCode")
        .join("orderDetails", "orderDetails.orderId", "orders.id")
        .join("products", "products.id", "orderDetails.productId")
        .join("categories", "categories.id", "products.categoryId")
        .where("orders.customerId", customerId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid");
        });

      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignOrders.id",
          "categories.supplierId",
          "campaignOrders.orderCode",
          "campaignOrders.campaignId",
        )
        .join('campaigns', 'campaigns.id', 'campaignOrders.campaignId')
        .join("products", "products.id", "campaigns.productId")
        .join("categories", "categories.id", "products.categoryId")
        .where("campaignOrders.customerId", customerId)
        .andWhere((cd) => {
          cd.where("campaignOrders.status", "advanced")
            .orWhere("campaignOrders.status", "created")
            .orWhere("campaignOrders.status", "unpaid");
        });

      if (orderRetail.length > 0) {
        for (const item of orderRetail) {
          await Order.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const suppAccountId = await Suppliers.query()
            .select("accountId")
            .where("id", item.supplierId)
            .first();
          notif.sendNotiForWeb({
            userId: suppAccountId.accountId,
            link: item.orderCode,
            message:
              "Order " + item.orderCode + " has been cancelled because customer account has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            orderStatus: "cancelled",
            type: "retail",
            retailOrderId: item.id,
            // image: JSON.stringify(image),
            orderCode: item.orderCode,
            description:
              "has been cancelled for: customer account has been disabled",
          } as OrderStatusHistory);
        }
      }

      //send notif for supp for campaign
      if (orderCampaign.length > 0) {
        for (const item of orderCampaign) {
          await CampaignOrder.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const suppAccountId = await Suppliers.query()
            .select("accountId")
            .where("id", item.supplierId)
            .first();
          notif.sendNotiForWeb({
            userId: suppAccountId.accountId,
            link: item.orderCode,
            message:
              "Order " +
              item.orderCode +
              " has been cancelled because customer account has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            orderStatus: "cancelled",
            type: "campaign",
            campaignOrderId: item.id,
            // image: JSON.stringify(image),
            orderCode: item.orderCode,
            description:
              "has been cancelled for: customer account has been disabled ",
          } as OrderStatusHistory);
          if (item.campaignId !== undefined) {
            const campaign = await Campaigns.query().select().where('id', item.campaignId).first();
            if (campaign.isShare) {
              var obj = JSON.parse(campaign.range as any);
              obj.sort(function (a: any, b: any) { return a.quantity - b.quantity });
              const allOrdersInCampaign: any = await CampaignOrder.query().select().where('campaignId', item.campaignId).andWhere('status', 'advanced');
              const currentQuantity = allOrdersInCampaign.reduce(
                (acc: any, curr: any) => parseInt(acc) + parseInt(curr.quantity),
                0
              );
              let price: any = 0
              if (currentQuantity < obj[0].quantity) {
                price = campaign.price
              } else {
                for (let i = 0; i < obj.length; i++) {
                  if (currentQuantity >= obj[i].quantity) {
                    price = obj[i].price;
                  }
                }
              }
              let discountPrice;
              for (const item of allOrdersInCampaign) {
                discountPrice = item.totalPrice - price * item.quantity;
                discountPrice +=
                  (price *
                    item.quantity *
                    item.loyalCustomerDiscountPercent) /
                  100;
                await CampaignOrder.query()
                  .update({
                    discountPrice: discountPrice,
                  })
                  .where("id", item.id);

              }
            }
          }
        }
      }
      const disableCustomer = await Customers.query()
        .update({
          isDeleted: true,
        })
        .where("id", customerId);

      const cusAccount = await Customers.query()
        .select("accountId")
        .where("id", customerId)
        .first();

      const deactivatedAccount = await Accounts.query()
        .update({
          isDeleted: true,
          reasonForDisabling: reasonForDisabling
        })
        .where("id", cusAccount.accountId);

      return res.status(200).send({
        message: "successful",
        data: disableCustomer,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public enableCustomerByCusId = async (req: any, res: any) => {
    try {
      const customerId = req.body.customerId;
      const reasonForEnabling= req.body.reasonForEnabling;

      const update = await Customers.query()
        .update({
          isDeleted: false,
        })
        .where("isDeleted", true)
        .andWhere("id", customerId);

      const accountId = await Customers.query()
        .select("accountId")
        .where("id", customerId)
        .first();

      const acc = await Accounts.query()
        .update({
          isDeleted: false,
          reasonForEnabling: reasonForEnabling
        })
        .where("id", accountId.accountId);

      return res.status(200).send({
        message: "successful",
        data: {
          info: update,
          acc,
        },
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public enableSupplier = async (req: any, res: any) => {
    try {
      const supplierId = req.body.supplierId;
      const reasonForEnabling = req.body.reasonForEnabling;
      const data = await Suppliers.query()
        .update({
          isDeleted: false,
        })
        .where("isDeleted", true)
        .andWhere("id", supplierId);

      const accountId = await Suppliers.query()
        .select("accountId")
        .where("id", supplierId)
        .first();

      const acc = await Accounts.query()
        .update({
          isDeleted: false,
          reasonForEnabling: reasonForEnabling
        })
        .where("id", accountId.accountId);

      return res.status(200).send({
        message: "successful",
        data: {
          info: data,
          acc,
        },
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public getAllProducts = async (req: any, res: any) => {
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
        "products.reasonForDisabling as reasonForDisabling",
        "products.reasonForEnabling as reasonForEnabling",

      ];


      const List = await Categories.query()
        .select(...dbEntity.productEntity, ...dbEntity.categoryEntity, ...ListSupplierEntity)
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .join("products", "products.categoryId", "categories.id")
        .orderBy("products.updatedAt", "desc");
      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  // public activeProduct = async (req: any, res: any) => {
  //   try {
  //     const productId = req.body.productId;

  //     const update = await Products.query().select().update({
  //       status: 'active'
  //     })
  //       .where('id', productId).first();

  //     return res.status(200).send({
  //       message: "successful",
  //       data: update
  //     })
  //   } catch (error) {
  //     console.log(error); return res.status(400).send({ message: error });
  //   }
  // };
}

export default new System();
