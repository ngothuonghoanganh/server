import { Order } from "../models/orders";
import { OrderDetail } from "../models/orderdetail";
import { Address } from "../models/address";

import crypto from "crypto";
import { Campaigns } from "../models/campaigns";
import { Products } from "../models/products";
import { LoyalCustomerCondition } from "../models/loyalCustomerCondition";
import { LoyalCustomer } from "../models/loyalCustomer";
import { CampaignOrder } from "../models/campaingorder";
import { Categories } from "../models/category";
import transactionController from "./transaction";
import { Transaction } from "../models/transaction";
import { OrderStatusHistory } from "../models/orderstatushistory";
import orderStatusHistoryController from "./orderStatusHistoryController";
import supplier from "./supplier";
import { Suppliers } from "../models/suppliers";
import { Accounts } from "../models/accounts";
import { CustomerDiscountCode } from "../models/customerdiscountcode";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";

class OrderController {
  public createOrder = async (req: any, res: any) => {
    try {
      let {
        campaignId,
        addressId = null,
        paymentId,
        discountPrice = "",
        shippingFee = "",
        products,
        supplierId,
        isWholeSale = false,
        customerDiscountCodeId = null,
        inCart = false,
        paymentMethod = "cod",
      } = req.body;

      const address: Address = await Address.query()
        .select()
        .where("id", addressId)
        .first();

      const supplierData = await Suppliers.query()
        .select("accountId")
        .where("id", supplierId)
        .first();

      let orderCode = crypto.randomBytes(5).toString("hex") + `-${Date.now()}`;

      if (campaignId) {
        const newOrder = await CampaignOrder.query().insert({
          customerId: req.user.id,
          address: address?.street + " " + address?.province,
          orderCode: orderCode,
          discountPrice: discountPrice,
          shippingFee: shippingFee,
          totalPrice: products
            .map((item: any) => item.totalPrice)
            .reduce((prev: any, next: any) => {
              return prev + next;
            }),
          paymentMethod: paymentMethod,
          campaignId: campaignId,
          status: "notAdvanced",
          // productid: products[0].productId,
          productName: products[0].productName,
          quantity: products[0].quantity,
          price: products[0].price,
          note: products[0].notes,
          image: products[0].image,
        });

        for (const product of products) {
          await Products.query()
            .update({
              quantity: Products.raw(`
              quantity - ${product.quantity}
            `),
            })
            .where("id", product.productId);
          await OrderDetail.query().delete().where("id", product.cartId);
        }
        transactionController.createTransaction({
          orderCode: orderCode,
          isWithdrawable: false,
          type: "income",
          supplierId: supplierId,
        } as Transaction);

        // orderStatusHistoryController.createHistory({
        //   statushistory: "created",
        //   type: "retail",
        //   retailorderid: newOrder.id,
        //   ordercode: newOrder.ordercode,
        //   description: "is created",
        // } as OrderStatusHistory);

        // notif.sendNotiForWeb({
        //   userid: supplierData.accountid,
        //   link: newOrder.ordercode,
        //   message: "changed to " + "created", // statushistory = created
        //   status: "unread",
        // });

        return res.status(200).send({
          message: "successful",
          data: { ...newOrder },
        });
      }

      const newOrder = await Order.query().insert({
        customerId: req.user.id,
        customerDiscountCodeId: customerDiscountCodeId,
        paymentId: paymentId,
        // supplierid: supplierId,
        discountPrice: discountPrice,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
        status: paymentMethod === "cod" ? "created" : "unpaid",
        totalPrice: products
          .map((item: any) => item.totalPrice)
          .reduce((prev: any, next: any) => {
            return prev + next;
          }),
        orderCode: orderCode,
        address: address?.street + " " + address?.province,
      });
      let newOrderDetails: any = [];
      if (!inCart) {
        const details = [];

        for (const product of products) {
          details.push({
            // customerid: req.user.id,
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
            price: product.price,
            totalPrice: product.totalPrice,
            note: product.notes,
            orderCode: orderCode,
            image: product.image,
            orderId: newOrder.id,
            // incampaign: !campaignId ? false : true,
          });
        }

        newOrderDetails = await OrderDetail.query().insert(details);
      } else {
        for (const product of products) {
          await OrderDetail.query()
            .update({
              // customerid: req.user.id,
              productId: product.productId,
              productName: product.productName,
              quantity: product.quantity,
              price: product.price,
              totalPrice: product.totalPrice,
              note: product.notes,
              orderCode: orderCode,
              image: product.image,
              orderId: newOrder.id,
            })
            .where("id", product.cartId);
        }
        newOrderDetails = await OrderDetail.query()
          .select()
          .where("orderCode", orderCode);
      }
      // insert into history

      if (paymentMethod === "cod") {
        orderStatusHistoryController.createHistory({
          orderStatus: "created",
          type: "retail",
          retailOrderId: newOrder.id,
          orderCode: newOrder.orderCode,
          description: "is created",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userId: supplierData.accountId,
          link: newOrder.orderCode,
          message: "changed to " + "created",
          status: "unread",
        });
      } else {
        orderStatusHistoryController.createHistory({
          orderStatus: "unpaid",
          type: "retail",
          retailOrderId: newOrder.id,
          orderCode: newOrder.orderCode,
          description: "requires full payment via VNPAY E-Wallet",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userId: supplierData.accountId,
          link: newOrder.orderCode,
          message: "changed to " + "unpaid",
          status: "unread",
        });
      }
      for (const product of products) {
        await Products.query()
          .update({
            quantity: Products.raw(`
            quantity - ${product.quantity}
          `),
          })
          .where("id", product.productId);
      }

      transactionController.createTransaction({
        orderCode: orderCode,
        isWithdrawable: false,
        type: "income",
        supplierId: supplierId,
      } as Transaction);
      return res.status(200).send({
        message: "successful",
        data: {
          ...newOrder,
          details: newOrderDetails,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromDeliveredToCompletedForCustomer = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "completed",
        orderCode,
        orderId,
        type,
        description,
      } = req.body;

      let update = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "delivered");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "delivered");
      }

      const order: any =
        (await Order.query()
          .select(
            "orders.*",
            Order.raw(`sum(orderDetails.quantity) as orderquantity`)
          )
          .join("orderDetails", "orders.id", "orderDetails.orderid")
          .where("orders.ordercode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            "campaignOrders.*",
            "campaignOrders.quantity as orderquantity",
            "campaigns.supplierId as supplierid"
          )
          .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
          .where("campaignOrders.ordercode", orderCode)
          .first());

      if (order) {
        const loyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerId", order.customerid)
          .andWhere("supplierId", order.supplierid)
          .first();

        if (!loyalCustomer) {
          await LoyalCustomer.query().insert({
            customerId: order.customerid,
            supplierId: order.supplierid,
            numOfOrder: 1,
            numOfProduct: order.orderquantity,
          });
        } else {
          await LoyalCustomer.query()
            .update({
              customerId: order.customerid,
              supplierId: order.supplierid,
              numOfOrder: LoyalCustomer.raw(`numOfOrder + 1`),
              numOfProduct: LoyalCustomer.raw(
                `numOfProduct + ${order.orderquantity}`
              ),
            })
            .where("id", loyalCustomer.id);
        }

        const newLoyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerId", order.customerid)
          .andWhere("supplierId", order.supplierid)
          .andWhere("status", "active")
          .first();

        if (newLoyalCustomer) {
          const condition = await LoyalCustomerCondition.query()
            .select()
            .where("supplierId", order.supplierid)
            .andWhere("minOrder", "<=", newLoyalCustomer.numOfOrder)
            .andWhere("minProduct", "<=", newLoyalCustomer.numOfProduct);

          const maxPercent =
            condition.length > 0
              ? condition.reduce((p: any, c: any) =>
                  p.discountPercent > c.discountPercent ? p : c
                )
              : { discountPercent: 0 };

          await LoyalCustomer.query()
            .update({
              discountPercent: maxPercent.discountPercent,
            })
            .where("id", newLoyalCustomer.id);
        }
      }

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }

      transactionController.update({
        orderCode: order.ordercode,
        platformFee:
          ((order.totalPrice - (order.discountPrice || 0)) * 2) / 100,
        paymentFee: ((order.totalPrice - (order.discountPrice || 0)) * 2) / 100,
        orderValue:
          order.totalPrice -
          (order.discountPrice || 0) -
          (order.advanceFee || 0),
        isWithdrawable: true,
        type: "income",
        description:
          "The order is completed. Vendor is able to withdraw money.",
      } as any);

      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);

      //send notif for supplier
      let supplierDataForRetail;
      let supplierDataForCampaign;
      let accountIdSupp;
      if (type === "retail") {
        supplierDataForRetail = await Order.query()
          .select("supplierId")
          .where("id", orderId)
          .first();
        accountIdSupp = await Suppliers.query()
          .select("accountId")
          // .where("id", supplierDataForRetail.supplierId)
          .first();
      } else {
        supplierDataForCampaign = await Products.query()
          .select("products.supplierId")
          .join("campaignOrder", "campaignOrder.productId", "products.id")
          .where("campaignOrder.id", orderId)
          .first();
        accountIdSupp = await Suppliers.query()
          .select("accountid")
          // .where("id", supplierDataForCampaign.supplierid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdSupp.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // public updateStatusFromDeliveredToReturnedForCustomer = async (
  //   req: any,
  //   res: any
  // ) => {
  //   try {
  //     let { status = "returned", orderCode } = req.body;

  //     let update = await Order.query()
  //       .update({
  //         status: status,
  //       })
  //       .where("ordercode", orderCode)
  //       .andWhere("status", "completed");
  //     if (update === 0) {
  //       console.log("update campaign order");
  //       update = await CampaignOrder.query()
  //         .update({
  //           status: status,
  //         })
  //         .where("ordercode", orderCode)
  //         .andWhere("status", "completed");
  //     }
  //     if (update === 0) {
  //       return res.status(200).send({
  //         message: "not yet updated",
  //       });
  //     }
  //     return res.status(200).send({
  //       message: "successful",
  //       data: update,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  public updateStatusFromCreatedToProcessingForSupplier = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "processing",
        orderId,
        orderCode,
        type,
        // description /*, image*/,
      } = req.body;

      let updateStatus = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "created");
      if (updateStatus === 0) {
        console.log("update campaign order");
        updateStatus = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "created");
      }
      if (updateStatus === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }

      //insert status for order status history
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        orderCode: orderCode,
        description: "is being processed",
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: updateStatus,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusToCancelledForCustomer = async (req: any, res: any) => {
    try {
      let {
        status = "cancelled",
        orderCode,
        type,
        orderId,
        image,
        description,
      } = req.body;
      let update = await Order.query()
        .update({
          status: status,
        })
        .where("status", "created")
        .orWhere("status", "unpaid")
        .orWhere("status", "advanced")
        .andWhere("orderCode", orderCode);

      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("status", "created")
          .orWhere("status", "unpaid")
          .orWhere("status", "advanced")
          .andWhere("orderCode", orderCode);
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      return res.status(200).send({
        message: "updated successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusToCancelledForSupplier = async (req: any, res: any) => {
    try {
      let {
        status = "cancelled",
        orderCode,
        type,
        orderId,
        image,
        description,
      } = req.body;
      let update = await Order.query()
        .update({
          status: status,
        })
        .where((cd) => {
          cd.where("status", "created")
            .orWhere("status", "unpaid")
            .orWhere("status", "advanced")
            .orWhere("status", "processing");
        })
        .andWhere("orderCode", orderCode);

      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where((cd) => {
            cd.where("status", "created")
              .orWhere("status", "unpaid")
              .orWhere("status", "advanced")
              .orWhere("status", "processing");
          })
          .andWhere("orderCode", orderCode);
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      return res.status(200).send({
        message: "updated successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromProcessingToDeliveringForSupplier = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "delivering",
        orderCode,
        type,
        orderId,
        // description,
        image,
      } = req.body;

      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "processing");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "processing");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: "is being delivered",
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromDeliveringToDeliveredForDelivery = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "delivered",
        orderCode,
        type,
        orderId,
        description,
        image,
      } = req.body;
      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "delivering");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "delivering");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });

      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierId")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountId")
          // .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierId")
          .join("campaignOrder", "campaignOrder.productId", "products.id")
          .where("campaignOrder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountId")
          // .where("id", supplierDataForCampaign.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: supp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      }

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromDeliveringToCancelledForDelivery = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "cancelled",
        orderCode,
        type,
        orderId,
        description,
        image,
      } = req.body;
      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "delivering");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "delivering");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });

      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierId")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountId")
          // .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierId")
          .join("campaignOrder", "campaignOrder.productId", "products.id")
          .where("campaignOrder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountId")
          // .where("id", supplierDataForCampaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: supp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      }
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromReturningToDeliveredForRejectReturn = async (
    req: any,
    res: any
  ) => {
    try {
      let { orderCode, type, orderId, description, image } = req.body;
      const requestReturnTime = await OrderStatusHistory.query()
        .select()
        .where("orderCode", orderCode)
        .andWhere("orderStatus", "returning");
      let status;
      if (requestReturnTime.length === 1) {
        status = "delivered";
      } else {
        status = "completed";
      }
      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "returning");
      // console.log(update)
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "returning");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: "requestRejected",
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //query order history theo order code va status = returning
      // === 0 ->>> notif to customer
      // === 1 ->>> notif cus + supp

      console.log(requestReturnTime);
      //send notif to customer
      if (requestReturnTime.length === 1) {
        let customerObj;
        let accountIdCus;
        if (type === "retail") {
          customerObj = await Order.query()
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("customerId")
            .where("id", customerObj.customerId)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdCus.accountId,
          link: orderCode,
          message: "changed to " + "requestRejected",
          status: "unread",
        });
      } else {
        //send notif for customer
        let customerObj;
        let accountIdCus;
        if (type === "retail") {
          customerObj = await Order.query()
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerId")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdCus.accountId,
          link: orderCode,
          message: "changed to " + "requestRejected",
          status: "unread",
        });

        //send notif for supp
        if (type === "retail") {
          let suppId = await Order.query()
            .select("supplierId")
            .where("id", orderId)
            .first();
          let accountIdSupp = await Suppliers.query()
            .select("accountId")
            // .where("id", suppId.supplierid)
            .first();

          notif.sendNotiForWeb({
            userid: accountIdSupp.accountId,
            link: orderCode,
            message: "changed to " + "requestRejected",
            status: "unread",
          });
        } else {
          let supplierDataForCampaign = await Products.query()
            .select("products.supplierId")
            .join("campaignOrder", "campaignOrder.productId", "products.id")
            .where("campaignOrder.id", orderId)
            .first();
          let supp = await Suppliers.query()
            .select("accountId")
            // .where("id", supplierDataForCampaign.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: supp.accountId,
            link: orderCode,
            message: "changed to " + "requestRejected",
            status: "unread",
          });
        }
      }

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromDeliveredToReturningForCustomer = async (
    req: any,
    res: any
  ) => {
    try {
      let {
        status = "returning",
        orderCode,
        type,
        orderId,
        image,
        description,
      } = req.body;
      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "delivered");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "delivered");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierId")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountId")
          // .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierId")
          .join("campaignOrder", "campaignOrder.productId", "products.id")
          .where("campaignOrder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountId")
          // .where("id", supplierDataForCampaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: supp.accountId,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      }

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromReturningToReturned = async (req: any, res: any) => {
    try {
      let {
        status = "returned",
        orderCode,
        type,
        orderId,
        /* image,*/ description,
      } = req.body;
      let update: any = await Order.query()
        .update({
          status: status,
        })
        .where("orderCode", orderCode)
        .andWhere("status", "returning");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("orderCode", orderCode)
          .andWhere("status", "returning");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerId")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountId,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForCustomer = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const status = req.query.status;

      const orders: any = await Order.query()
        .select(
          "orders.*",

          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierId),json_agg(to_jsonb(orderDetail) - 'orderid') as details`
          )
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where("orders.customerId", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignOrder.*",
          "campaigns.supplierId",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierId), 
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
        .join("campaigns", "campaigns.id", "campaignOrder.campaignid")
        .where("campaignOrder.status", status)
        .andWhere("campaignOrder.customerId", userId)
        .groupBy("campaignOrder.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForSupplier = async (req: any, res: any) => {
    try {
      const userId = req.user.id;

      const orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(`(select customers.firstname as customerfirstname from customers where customers.id = orders.customerId),
           (select customers.lastname as customerlastname from customers where customers.id = orders.customerId),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where("orders.supplierId", userId)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          CampaignOrder.raw(
            `(select customers.firstname as customerfirstname from customers where customers.id = campaignOrder.customerId),
            (select customers.lastname as customerlastname from customers where customers.id = campaignOrder.customerId),
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
        .where("campaigns.supplierId", userId)
        .groupBy("campaignOrder.id");

      orders.push(...ordersInCampaign);

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForSupplierByStatus = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const status = req.query.status;

      const orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(`(select customers.firstName as customerfirstname from customers where customers.id = orders.customerId),
           (select customers.lastName as customerlastname from customers where customers.id = orders.customerId),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details, json_agg(to_jsonb(orderstatushistory) - 'retailorderid') as orderstatushistory`)
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .join(
          "orderStatusHistories",
          "orderStatusHistories.retailOrderId",
          "orders.id"
        )
        .where("orders.supplierId", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          CampaignOrder.raw(
            `(select customers.firstName as customerfirstname from customers where customers.id = campaignOrder.customerId),
            (select customers.lastName as customerlastname from customers where customers.id = campaignOrder.customerId),
            array_to_json(array_agg(json_build_object(
            'id','',
            'image', campaignorder.image,
            'price', campaignorder.price,
            'quantity', campaignorder.quantity,
            'ordercode', campaignorder.ordercode,
            'productid', campaignorder.productid,
            'campaignid', campaignorder.campaignid,
            'incampaign', true,
            'customerid', campaignorder.customerid,
            'totalprice', campaignorder.totalprice,
            'productname', campaignorder.productname,
            'notes', campaignorder.notes)
            )) as details, json_agg(to_jsonb(orderstatushistory) - 'campaignorderid') as orderstatushistory`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrder.campaignId")
        .join(
          "orderStatusHistories",
          "orderStatusHistories.campaignOrderId",
          "campaignOrder.id"
        )
        .where("campaigns.supplierId", userId)
        .andWhere("campaignOrder.status", status)
        .groupBy("campaignOrder.id");

      orders.push(...ordersInCampaign);

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForSupplierAllowCampaign = async (req: any, res: any) => {
    try {
      const campaignId = req.params.campaignId;
      const userId = req.user.id;

      const orders = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          CampaignOrder.raw(
            `(select customers.firstName as customerfirstname from customers where customers.id = campaignOrder.customerId),
          (select customers.lastName as customerlastname from customers where customers.id = campaignOrder.customerId),
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
        .where("campaigns.supplierId", userId)
        .andWhere("campaigns.id", campaignId)
        .groupBy("campaignOrder.id");

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderById = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      let orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(`json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where("orders.customerId", userId)
        .andWhere("orders.id", orderId)
        .groupBy("orders.id");
      if (orders.length === 0) {
        orders = await CampaignOrder.query().select().where("id", orderId);
        // console.log(orders)

        orders[0].details = [];
        orders[0].details.push({
          id: "",
          image: orders[0].image,
          price: orders[0].price,
          quantity: orders[0].quantity,
          ordercode: orders[0].ordercode,
          productid: orders[0].productid,
          campaignid: orders[0].campaignid,
          customerid: orders[0].customerid,
          incampaign: true,
          totalprice: orders[0].totalprice,
          productname: orders[0].productname,
          notes: orders[0].notes,
        });
      }

      const productId = orders[0].details[0].productid;

      const supplier: any = await Categories.query()
        .select("suppliers.*")
        .join("suppliers", "suppliers.id", "categories.supplierId")
        .join("products", "products.categoryid", "categories.id")
        .where("products.id", productId)
        .first();

      orders[0].suppliername = supplier.name;
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public paymentOrder = async (req: any, res: any) => {
    try {
      const {
        orderId,
        status,
        isAdvanced,
        amount,
        vnp_TxnRef,
        type,
        orderCode,
      } = req.body;

      if (!isAdvanced) {
        await Order.query()
          .update({
            paymentId: vnp_TxnRef,
            status: status,
          })
          .where("id", orderId);
        await CampaignOrder.query()
          .update({ paymentId: vnp_TxnRef, status: status })
          .where("id", orderId);
      } else {
        await CampaignOrder.query()
          .update({
            advancedId: vnp_TxnRef,
            status: status,
            advanceFee: amount,
          })
          .where("id", orderId);

        const order = await CampaignOrder.query()
          .select()
          .where("id", orderId)
          .first();
        const campaignId = order.campaignId;

        const ordersInCampaign = await CampaignOrder.query()
          .select()

          .where("campaignid", campaignId)
          .andWhere("status", "advanced");

        const currentQuantity = ordersInCampaign.reduce(
          (acc: any, curr: any) => parseInt(acc) + parseInt(curr.quantity),
          0
        );
        const campaign = await Campaigns.query()
          .select()
          .where("id", campaignId)
          .andWhere("quantity", "<=", currentQuantity)
          .first();
        if (campaign) {
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
            .where("productid", campaign.productId)
            .andWhere("status", "active");

          if (getCampaigns.length === 0) {
            await Products.query()
              .update({ status: "active" })
              .where("id", campaign.productId);
          }

          for (const item of ordersInCampaign) {
            orderStatusHistoryController.createHistory({
              orderStatus:
                item.paymentMethod === "online" ? "unpaid" : "created",
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
              .where("id", item.customerId)
              .first();

            notif.sendNotiForWeb({
              userid: customer.accountId,
              link: item.orderCode,
              message: `campaign with code: ${campaign.code} is done`,
              status: "unread",
            });

            //type =campaign
          }
          let supplierId;
          supplierId = await Suppliers.query()
            .select()
            .where("id", campaign.supplierId)
            .first();
          notif.sendNotiForWeb({
            userid: supplierId.accountId,
            link: null,
            message: `campaign with code: ${campaign.code} is done`,
            status: "unread",
          });
        }

        transactionController.update({
          orderCode: order.orderCode,
          advanceFee: order.advanceFee,
          type: "income",
        } as Transaction);
      }

      //insert data vào order history
      if (status === "created") {
        orderStatusHistoryController.createHistory({
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          orderStatus: "created",
          orderCode: orderCode,
          type: type,
          description: "is created",
        } as OrderStatusHistory);

        let supplierDataForRetail;
        let supplierDataForCampaign;
        let accountIdSupp;
        if (type === "retail") {
          supplierDataForRetail = await Order.query()
            .select("supplierId")
            .where("id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountId")
            // .where("id", supplierDataForRetail.supplierid)
            .first();
        } else {
          supplierDataForCampaign = await Products.query()
            .select("products.supplierId")
            .join("campaignOrder", "campaignOrder.productid", "products.id")
            .where("campaignOrder.id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountId")
            // .where("id", supplierDataForCampaign.supplierid)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdSupp.accountId,
          link: orderCode,
          message: "changed to " + "created",
          status: "unread",
        });
      } else if (status === "advanced") {
        if (isAdvanced) {
          orderStatusHistoryController.createHistory({
            retailOrderId: type === "retail" ? orderId : null,
            campaignOrderId: type === "campaign" ? orderId : null,
            orderStatus: "advanced",
            orderCode: orderCode,
            type: "campaign",
            description: "has completed advanced payment via VNPAY E-Wallet",
          } as OrderStatusHistory);
          // TODO
          //type = campaign
          let supplierDataForCampaign = await Products.query()
            .select("products.supplierId")
            .join("campaignOrder", "campaignOrder.productId", "products.id")
            .where("campaignOrder.id", orderId)
            .first();
          let accountIdSupp = await Suppliers.query()
            .select("accountId")
            // .where("id", supplierDataForCampaign.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: accountIdSupp.accountId,
            link: orderCode,
            message: "changed to " + "advanced",
            status: "unread",
          });
        } else {
          orderStatusHistoryController.createHistory({
            retailOrderId: type === "retail" ? orderId : null,
            campaignOrderId: type === "campaign" ? orderId : null,
            orderStatus: "advanced",
            orderCode: orderCode,
            type: "campaign",
            description: "has completed full payment via VNPAY E-Wallet",
          } as OrderStatusHistory);

          //insert send notif
          let supplierDataForCampaign = await Products.query()
            .select("products.supplierid")
            .join("campaignOrder", "campaignOrder.productId", "products.id")
            .where("campaignOrder.id", orderId)
            .first();
          let accountIdSupp = await Suppliers.query()
            .select("accountid")
            // .where("id", supplierDataForCampaign.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: accountIdSupp.accountId,
            link: orderCode,
            message: "changed to " + "advanced",
            status: "unread",
          });
        }
      }

      return res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getListOrderForDelivery = async (req: any, res: any) => {
    try {
      const status = req.query.status;
      // console.log(status);
      const orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierId), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignOrder.*",
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
        .where("campaignOrder.status", status)
        .groupBy("campaignOrder.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);
      return res.status(200).send({
        message: "successful",
        data: { orders: orders },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderByCode = async (req: any, res: any, next: any) => {
    try {
      let customerId;
      let supplierId;
      const orderCode = req.query.orderCode;

      const orderRetail: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierId), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderDetail", "orders.id", "orderDetail.orderid")
        .where("orders.orderCode", orderCode)
        .groupBy("orders.id")
        .first();
      // console.log(orderRetail.customerid)
      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignOrder.*",
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
        .where("campaignOrder.orderCode", orderCode)
        .groupBy("campaignOrder.id")
        .groupBy("campaigns.id")
        .first();
      // console.log(orderCampaign)
      if (orderRetail) {
        customerId = await Customers.query()
          .select("accountId")
          .where("id", orderRetail.customerId)
          .first();
        supplierId = await Suppliers.query()
          .select("accountId")
          .where("id", orderRetail.supplierId)
          .first();
      } else {
        customerId = await Customers.query()
          .select("accountId")
          .where("id", orderCampaign.customerId)
          .first();
        supplierId = await Suppliers.query()
          .select("accountId")
          .where("id", orderCampaign.supplierId)
          .first();
      }
      return res.status(200).send({
        message: "successful",
        data: {
          order: orderRetail || orderCampaign,
          customerId: { ...customerId },
          supplierId: { ...supplierId },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new OrderController();
