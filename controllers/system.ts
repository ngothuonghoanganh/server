import { Accounts } from "../models/accounts";
import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import { Categories } from "../models/category";
import { Customers } from "../models/customers";
import { Order } from "../models/orders";
import { OrderStatusHistory } from "../models/orderstatushistory";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import notif from "../services/realtime/notification";
import orderStatusHistoryController from "./orderStatusHistoryController";

class System {
  public getAllOrders = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierId),json_agg(to_jsonb(orderDetail) - 'orderid') as details`
          )
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where((cd) => {
          if (status) {
            cd.where("orders.status", status);
          }
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierId",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierid), 
            array_to_json(array_agg(json_build_object(
            'id','',
            'image', image,
            'price', campaignorder.price,
            'quantity', campaignorder.quantity,
            'ordercode', ordercode,
            'productid', campaignorder.productid,
            'campaignid', campaignid,
            'incampaign', true,
            'customerid', customerid,
            'totalprice', totalprice,
            'productname', campaignorder.productname,
            'notes', campaignorder.notes)
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrder.campaignId")
        .where((cd) => {
          if (status) {
            cd.where("campaignOrder.status", status);
          }
        })
        .groupBy("campaignOrder.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);

      for (const order of orders) {
        const customer = await Customers.query()
          .select()
          .where("id", order.customerid)
          .first();
        order.customer = customer;
      }
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCampaigns = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const listProductEntities = [
        "products.name as productname",
        "products.retailPrice as productretailprice",
        "products.quantity as productquantity",
      ];
      const campaigns = await Campaigns.query()
        .select("campaigns.*", ...listProductEntities)
        .join("products", "campaigns.productId", "products.id")
        .where((cd) => {
          if (status) {
            cd.where("campaigns.status", status);
          }
        });

      return res.status(200).send({
        message: "successful",
        data: campaigns,
      });
    } catch (error) {
      console.log(error);
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
        "suppliers.eWalletSecrect as ewalletsecrect",
      ];
      const suppliername = req.query.supplierName;
      const suppliers = await Suppliers.query()
        .select(...ListEntitysupplier, ...ListEntityAccount)
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
      console.log(error);
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
        "customers.eWalletCccount as ewalletaccount",
        "customers.eWalletProvider as ewalletprovider",
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
        .select(...ListEntityAccount, ...ListEntityCustomer)
        .join("accounts", "accounts.id", "customers.accountId")
        .where((cd) => {
          if (customername) {
            cd.where("firstname", "like", `%${customername}%`).orWhere(
              "lastname",
              "like",
              `%${customername}%`
            );
          }
        });
      return res.status(200).send({
        message: "successful",
        data: customers,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public disableSupplier = async (req: any, res: any, next: any) => {
    try {
      const { supplierId } = req.body;

      const products = await Products.query()
        .select("products.id")
        .join("categories", "products.categoryId", "categories.id")
        .where("categories.supplierId", supplierId)
        .andWhere("products.status", "<>", "deactivated");

      const campaign = await Campaigns.query()
        .select("campaigns.id")

        .where("supplierid", supplierId)
        .andWhere((cd) => {
          cd.where("status", "active").orWhere("status", "ready");
        });

      const campaignIds = campaign.map((item: any) => item.id);
      const productIds = products.map((item: any) => item.id);

      const orders: any = await Order.query()
        .select()
        .join("orderDetail", "orders.id", "orderDetail.orderId")
        .whereIn("orderDetail.productId", productIds)
        .andWhere((cd) => {
          cd.where("orders.status", "processing")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid")
            .orWhere("orders.status", "advanced");
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select()
        .whereIn("campaignOrder.productId", productIds)
        .andWhere((cd) => {
          cd.where("campaignOrder.status", "processing")
            .orWhere("campaignOrder.status", "created")
            .orWhere("campaignOrder.status", "unpaid")
            .orWhere("campaignOrder.status", "advanced");
        })
        .groupBy("campaignOrder.id");
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
          userid: customer.accountId,
          link: item.orderCode,
          message: "changed to " + "cancelled",
          status: "cancelled",
        });
        //type= retail
        orderStatusHistoryController.createHistory({
          orderStatus: "cancelled",
          type: "retail",
          retailOrderId: item.id,
          orderCode: item.Code,
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
          userid: customer.accountId,
          link: item.orderCode,
          message: "changed to " + "cancelled",
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
      console.log(error);
    }
  };

  public disableCustomer = async (req: any, res: any) => {
    try {
      const customerId = req.body.customerId;
      const orderRetail: any = await Order.query()
        .select("orders.id", "categories.supplierId", "orders.orderCode")
        .join("orderDetail", "orderDetail.orderId", "orders.id")
        .join("products", "products.id", "orderDetail.productId")
        .join("categories", "categories.id", "products.categoryId")
        .where("orders.customerId", customerId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid");
        });

      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignOrder.id",
          "categories.supplierId",
          "campaignOrder.orderCode"
        )
        .join("products", "products.id", "campaignOrder.productId")
        .join("categories", "categories.id", "products.categoryId")
        .where("campaignOrder.customerId", customerId)
        .andWhere((cd) => {
          cd.where("campaignOrder.status", "advanced")
            .orWhere("campaignOrder.status", "created")
            .orWhere("campaignOrder.status", "unpaid");
        });

      if (orderRetail.length > 0) {
        for (const item of orderRetail) {
          await Order.query()
            .update({
              status: "cancelled",
            })
            .where("id", item.id);
          const suppAccountId = await Suppliers.query()
            .select("accountid")
            .where("id", item.supplierId)
            .first();
          notif.sendNotiForWeb({
            userid: suppAccountId.accountId,
            link: item.orderCode,
            message:
              "Order " +
              item.orderCode +
              " has been cancelled because customer account has been disabled",
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
            .select("accountid")
            .where("id", item.supplierId)
            .first();
          notif.sendNotiForWeb({
            userid: suppAccountId.accountId,
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
        })
        .where("id", cusAccount.accountId);

      return res.status(200).send({
        message: "successful",
        data: disableCustomer,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public enableCustomerByCusId = async (req: any, res: any) => {
    try {
      const customerId = req.body.customerId;

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
      console.log(error);
    }
  };

  public enableSupplier = async (req: any, res: any) => {
    try {
      const supplierId = req.body.supplierId;
      // const dateForUpdate = await Suppliers.query().select('updatedat').where('id', supplierId).first();

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
      console.log(error);
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
      ];

      const List = await Categories.query()
        .select("products.*", "categories.*", ...ListSupplierEntity)
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .join("products", "products.categoryId", "categories.id")
        .orderBy("products.updatedAt", "desc");
      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new System();
