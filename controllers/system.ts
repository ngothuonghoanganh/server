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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where((cd) => {
          if (status) {
            cd.where("orders.status", status);
          }
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierid",
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
        .join("campaigns", "campaigns.id", "campaignorder.campaignid")
        .where((cd) => {
          if (status) {
            cd.where("campaignorder.status", status);
          }
        })
        .groupBy("campaignorder.id")
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
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
      ];
      const campaigns = await Campaigns.query()
        .select("campaigns.*", ...listProductEntities)
        .join("products", "campaigns.productid", "products.id")
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
        "accounts.roleid as roleid",
        "accounts.username as username",
        "accounts.googleid as googleid",
        "accounts.phone as phone",
        "accounts.isdeleted as accountisdeleted",
      ];

      const ListEntitysupplier = [
        "suppliers.id as id",
        "suppliers.accountid as accountid",
        "suppliers.name as name",
        "suppliers.email as email",
        "suppliers.avt as avt",
        "suppliers.isdeleted as isdeleted",
        "suppliers.createdat as createdat",
        "suppliers.updatedat as updatedat",
        "suppliers.address as address",
        "suppliers.identificationcard as identificationcard",
        "suppliers.identificationimage as identificationimage",
        "suppliers.ewalletcode as ewalletcode",
        "suppliers.ewalletsecrect as ewalletsecrect",
      ];
      const suppliername = req.query.supplierName;
      const suppliers = await Suppliers.query()
        .select(...ListEntitysupplier, ...ListEntityAccount)
        .join("accounts", "accounts.id", "suppliers.accountid")
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
        "customers.firstname as fistname",
        "customers.lastname as lastname",
        "customers.email as email",
        "customers.avt as avt",
        "customers.isdeleted as customerisdeleted",
        "customers.createdat as createdat",
        "customers.updatedat as updatedat",
        "customers.ewalletaccount as ewalletaccount",
        "customers.ewalletprovider as ewalletprovider",
      ];
      const ListEntityAccount = [
        "accounts.roleid as roleid",
        "accounts.username as username",
        "accounts.googleid as googleid",
        "accounts.phone as phone",
        "accounts.isdeleted as accountisdeleted",
      ];
      const customername = req.query.customerName;
      const customers = await Customers.query()
        .select(...ListEntityAccount, ...ListEntityCustomer)
        .join("accounts", "accounts.id", "customers.accountid")
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
        .join("categories", "products.categoryid", "categories.id")
        .where("categories.supplierid", supplierId)
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
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .whereIn("orderdetail.productid", productIds)
        .andWhere((cd) => {
          cd.where("orders.status", "processing")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid")
            .orWhere("orders.status", "advanced");
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select()
        .whereIn("campaignorder.productid", productIds)
        .andWhere((cd) => {
          cd.where("campaignorder.status", "processing")
            .orWhere("campaignorder.status", "created")
            .orWhere("campaignorder.status", "unpaid")
            .orWhere("campaignorder.status", "advanced");
        })
        .groupBy("campaignorder.id");
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
          .where("id", item.customerid)
          .first();
        notif.sendNotiForWeb({
          userid: customer.accountid,
          link: item.ordercode,
          message: "Order " + item.ordercode + " has been cancelled",
          status: "cancelled",
        });
        //type= retail
        orderStatusHistoryController.createHistory({
          statushistory: "cancelled",
          type: "retail",
          retailorderid: item.id,
          ordercode: item.ordercode,
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
          .where("id", item.customerid)
          .first();
        notif.sendNotiForWeb({
          userid: customer.accountid,
          link: item.ordercode,
          message: "Order " + item.ordercode + " has been cancelled",
          status: "cancelled",
        });

        //type= campaign
        orderStatusHistoryController.createHistory({
          statushistory: "cancelled",
          type: "campaign",
          campaignorderid: item.id,
          ordercode: item.ordercode,
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
          isdeleted: true,
        })
        .where("id", supplierId);
      const accountId = await Suppliers.query()
        .select("accountid")
        .where("id", supplierId)
        .first();
      const deactivatedAccount = await Accounts.query()
        .update({
          isdeleted: true,
        })
        .where("id", accountId.accountid);

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
        .select("orders.id", "categories.supplierid", "orders.ordercode")
        .join("orderdetail", "orderdetail.orderid", "orders.id")
        .join("products", "products.id", "orderdetail.productid")
        .join("categories", "categories.id", "products.categoryid")
        .where("orders.customerid", customerId)
        .andWhere((cd) => {
          cd.where("orders.status", "advanced")
            .orWhere("orders.status", "created")
            .orWhere("orders.status", "unpaid");
        });

      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignorder.id",
          "categories.supplierid",
          "campaignorder.ordercode"
        )
        .join("products", "products.id", "campaignorder.productid")
        .join("categories", "categories.id", "products.categoryid")
        .where("campaignorder.customerid", customerId)
        .andWhere((cd) => {
          cd.where("campaignorder.status", "advanced")
            .orWhere("campaignorder.status", "created")
            .orWhere("campaignorder.status", "unpaid");
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
            .where("id", item.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: suppAccountId.accountid,
            link: item.ordercode,
            message:
              "Order " + item.ordercode + " has been cancelled because customer account has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            statushistory: "cancelled",
            type: "retail",
            retailorderid: item.id,
            // image: JSON.stringify(image),
            ordercode: item.ordercode,
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
            .where("id", item.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: suppAccountId.accountid,
            link: item.ordercode,
            message:
              "Order " +
              item.ordercode +
              " has been cancelled because customer account has been disabled",
            status: "unread",
          });
          orderStatusHistoryController.createHistory({
            statushistory: "cancelled",
            type: "campaign",
            campaignorderid: item.id,
            // image: JSON.stringify(image),
            ordercode: item.ordercode,
            description:
              "has been cancelled for: customer account has been disabled ",
          } as OrderStatusHistory);
        }
      }
      const disableCustomer = await Customers.query()
        .update({
          isdeleted: true,
        })
        .where("id", customerId);

      const cusAccount = await Customers.query()
        .select("accountid")
        .where("id", customerId)
        .first();

      const deactivatedAccount = await Accounts.query()
        .update({
          isdeleted: true,
        })
        .where("id", cusAccount.accountid);

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
          isdeleted: false,
        })
        .where("isdeleted", true)
        .andWhere("id", customerId);

      const accountId = await Customers.query()
        .select("accountid")
        .where("id", customerId)
        .first();

      const acc = await Accounts.query()
        .update({
          isdeleted: false,
        })
        .where("id", accountId.accountid);

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
          isdeleted: false,
        })
        .where("isdeleted", true)
        .andWhere("id", supplierId);

      const accountId = await Suppliers.query()
        .select("accountid")
        .where("id", supplierId)
        .first();

      const acc = await Accounts.query()
        .update({
          isdeleted: false,
        })
        .where("id", accountId.accountid);

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
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const List = await Categories.query()
        .select("products.*", "categories.*", ...ListSupplierEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join("products", "products.categoryid", "categories.id")
        .orderBy("products.updatedat", "desc");
      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public activeProduct = async (req: any, res: any) => {
    try {
      const productId = req.body.productId;

      const update = await Products.query().select().update({
        status: 'active'
      })
        .where('id', productId).first();

      return res.status(200).send({
        message: "successful",
        data: update
      })
    } catch (error) {
      console.log(error)
    }
  };
}

export default new System();
