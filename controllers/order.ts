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
        loyalcustomerdiscountpercent = 0,
      } = req.body;

      const address: Address = await Address.query()
        .select()
        .where("id", addressId)
        .first();

      const supplierData = await Suppliers.query()
        .select("accountid")
        .where("id", supplierId)
        .first();

      let orderCode = crypto.randomBytes(5).toString("hex") + `-${Date.now()}`;

      if (campaignId) {
        const newOrder = await CampaignOrder.query().insert({
          customerid: req.user.id,
          address: address?.street + " " + address?.province,
          ordercode: orderCode,
          discountprice: discountPrice,
          shippingfee: shippingFee,
          totalprice: products
            .map((item: any) => item.totalPrice)
            .reduce((prev: any, next: any) => {
              return prev + next;
            }),
          paymentmethod: paymentMethod,
          campaignid: campaignId,
          status: "notAdvanced",
          loyalcustomerdiscountpercent: loyalcustomerdiscountpercent,
          productid: products[0].productId,
          productname: products[0].productName,
          quantity: products[0].quantity,
          price: products[0].price,
          notes: products[0].notes,
          image: products[0].image,
        });

        for (const product of products) {
          // await Products.query()
          //   .update({
          //     quantity: Products.raw(`
          //     quantity - ${product.quantity}
          //   `),
          //   })
          //   .where("id", product.productId);
          await OrderDetail.query().delete().where("id", product.cartId);
        }
        const transaction = await Transaction.query()
          .select()
          .where("supplierid", supplierId)
          .andWhere("type", "income")
          .andWhere("status", "active")
          .first();

        if (!transaction)
          transactionController.createTransaction({
            // ordercode: orderCode,
            iswithdrawable: false,
            type: "income",
            supplierid: supplierId,
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
        customerid: req.user.id,
        iswholesale: isWholeSale,
        customerdiscountcodeid: customerDiscountCodeId,
        campaignid: campaignId,
        addressid: addressId,
        paymentid: paymentId,
        supplierid: supplierId,
        discountprice: discountPrice,
        shippingfee: shippingFee,
        paymentmethod: paymentMethod,
        status: paymentMethod === "cod" ? "created" : "unpaid",
        loyalcustomerdiscountpercent: loyalcustomerdiscountpercent,
        totalprice: products
          .map((item: any) => item.totalPrice)
          .reduce((prev: any, next: any) => {
            return prev + next;
          }),
        ordercode: orderCode,
        address: address?.street + " " + address?.province,
      });
      let newOrderDetails: any = [];
      if (!inCart) {
        const details = [];

        for (const product of products) {
          details.push({
            customerid: req.user.id,
            productid: product.productId,
            productname: product.productName,
            quantity: product.quantity,
            price: product.price,
            totalprice: product.totalPrice,
            notes: product.notes,
            ordercode: orderCode,
            image: product.image,
            orderid: newOrder.id,
            incampaign: !campaignId ? false : true,
          });
          await Products.query()
            .update({
              quantity: Products.raw(`
                quantity - ${product.quantity}
              `),
            })
            .where("id", product.productId);
        }

        newOrderDetails = await OrderDetail.query().insert(details);
      } else {
        for (const product of products) {
          await OrderDetail.query()
            .update({
              customerid: req.user.id,
              productid: product.productId,
              productname: product.productName,
              quantity: product.quantity,
              price: product.price,
              totalprice: product.totalPrice,
              notes: product.notes,
              ordercode: orderCode,
              image: product.image,
              orderid: newOrder.id,
            })
            .where("id", product.cartId);
          await Products.query()
            .update({
              quantity: Products.raw(`
                quantity - ${product.quantity}
              `),
            })
            .where("id", product.productId);
        }
        newOrderDetails = await OrderDetail.query()
          .select()
          .where("ordercode", orderCode);

      }
      // insert into history

      if (paymentMethod === "cod") {
        orderStatusHistoryController.createHistory({
          statushistory: "created",
          type: "retail",
          retailorderid: newOrder.id,
          ordercode: newOrder.ordercode,
          description: "is created",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userid: supplierData.accountid,
          link: newOrder.ordercode,
          message: "changed to " + "created",
          status: "unread",
        });
      } else {
        orderStatusHistoryController.createHistory({
          statushistory: "unpaid",
          type: "retail",
          retailorderid: newOrder.id,
          ordercode: newOrder.ordercode,
          description: "requires full payment via VNPAY E-Wallet",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userid: supplierData.accountid,
          link: newOrder.ordercode,
          message: "changed to " + "unpaid",
          status: "unread",
        });
      }
      // for (const product of products) {
      //   await Products.query()
      //     .update({
      //       quantity: Products.raw(`
      //       quantity - ${product.quantity}
      //     `),
      //     })
      //     .where("id", product.productId);
      // }

      const transaction = await Transaction.query()
        .select()
        .where("supplierid", supplierId)
        .andWhere("type", "income")
        .andWhere("status", "active")
        .first();

      if (!transaction)
        transactionController.createTransaction({
          // ordercode: orderCode,
          iswithdrawable: false,
          type: "income",
          supplierid: supplierId,
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
        .where("ordercode", orderCode)
        .andWhere("status", "delivered");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "delivered");
      }

      const order: any =
        (await Order.query()
          .select(
            "orders.*",
            Order.raw(`sum(orderdetail.quantity) as orderquantity`)
          )
          .join("orderdetail", "orders.id", "orderdetail.orderid")
          .where("orders.ordercode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            "campaignorder.*",
            "campaignorder.quantity as orderquantity",
            "campaigns.supplierid as supplierid"
          )
          .join("campaigns", "campaigns.id", "campaignorder.campaignid")
          .where("campaignorder.ordercode", orderCode)
          .first());

      if (order) {
        const loyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerid", order.customerid)
          .andWhere("supplierid", order.supplierid)
          .first();

        if (!loyalCustomer) {
          await LoyalCustomer.query().insert({
            customerid: order.customerid,
            supplierid: order.supplierid,
            numoforder: 1,
            numofproduct: order.orderquantity,
          });
        } else {
          await LoyalCustomer.query()
            .update({
              customerid: order.customerid,
              supplierid: order.supplierid,
              numoforder: LoyalCustomer.raw(`numoforder + 1`),
              numofproduct: LoyalCustomer.raw(
                `numofproduct + ${order.orderquantity}`
              ),
            })
            .where("id", loyalCustomer.id);
        }

        const newLoyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerid", order.customerid)
          .andWhere("supplierid", order.supplierid)
          .andWhere("status", "active")
          .first();

        if (newLoyalCustomer) {
          const condition = await LoyalCustomerCondition.query()
            .select()
            .where("supplierid", order.supplierid)
            .andWhere("minorder", "<=", newLoyalCustomer.numoforder)
            .andWhere("minproduct", "<=", newLoyalCustomer.numofproduct);

          const maxPercent =
            condition.length > 0
              ? condition.reduce((p: any, c: any) =>
                p.discountpercent > c.discountpercent ? p : c
              )
              : { discountpercent: 0 };

          await LoyalCustomer.query()
            .update({
              discountpercent: maxPercent.discountpercent,
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
        // ordercode: order.ordercode,
        supplierid: order.supplierid,
        advancefee: Transaction.raw(`advancefee + ${order.advancefee || 0}`),
        platformfee: Transaction.raw(
          `platformfee + ${((order.totalprice - (order.discountprice || 0)) * 2) / 100
          }`
        ),
        paymentfee: Transaction.raw(
          `paymentfee + ${((order.totalprice - (order.discountprice || 0)) * 2) / 100
          }`
        ),
        ordervalue: Transaction.raw(
          `ordervalue + ${order.totalprice -
          (order.discountprice || 0) -
          (order.advancefee || 0)
          }`
        ),
        iswithdrawable: true,
        type: "income",
        description:
          "The order is completed. Vendor is able to withdraw money.",
        status: "active",
      } as any);

      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);

      //send notif for supplier
      let supplierDataForRetail;
      let supplierDataForCampaign;
      let accountIdSupp;
      if (type === "retail") {
        supplierDataForRetail = await Order.query()
          .select("supplierid")
          .where("id", orderId)
          .first();
        accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForRetail.supplierid)
          .first();
      } else {
        supplierDataForCampaign = await Products.query()
          .select("products.supplierid")
          .join("campaignorder", "campaignorder.productid", "products.id")
          .where("campaignorder.id", orderId)
          .first();
        accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForCampaign.supplierid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdSupp.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "created");
      if (updateStatus === 0) {
        console.log("update campaign order");
        updateStatus = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "created");
      }
      if (updateStatus === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }

      //insert status for order status history
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        ordercode: orderCode,
        description: "is being processed",
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
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
        .andWhere("ordercode", orderCode);

      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("status", "created")
          .orWhere("status", "unpaid")
          .orWhere("status", "advanced")
          .andWhere("ordercode", orderCode);
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
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
        cancelLinkRequestor,
        supplierId,
      } = req.body;
      if (cancelLinkRequestor === "Supplier") {
        const order: any =
          (await Order.query()
            .select()
            .where("ordercode", orderCode)
            .first()) ||
          (await CampaignOrder.query()
            .select()
            .where("ordercode", orderCode)
            .first());
        if (order && order.status === "processing") {
          transactionController.createTransaction({
            description:
              "charge money because Supplier cancel order in status: processing",
            iswithdrawable: false,
            type: "penalty",
            supplierid: supplierId,
            penaltyfee: (order.totalprice || 0) * 0.2,
            ordercode: orderCode || null,
          } as any);
        }
      }
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
        .andWhere("ordercode", orderCode);

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
          .andWhere("ordercode", orderCode);
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "processing");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "processing");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: "is being delivered",
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "delivering");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "delivering");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });

      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierid")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountid,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierid")
          .join("campaignorder", "campaignorder.productid", "products.id")
          .where("campaignorder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForCampaign.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: supp.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "delivering");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "delivering");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
        link: orderCode,
        message: "changed to " + status,
        status: "unread",
      });

      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierid")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountid,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierid")
          .join("campaignorder", "campaignorder.productid", "products.id")
          .where("campaignorder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForCampaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: supp.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("statushistory", "returning");
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
        .where("ordercode", orderCode)
        .andWhere("status", "returning");
      // console.log(update)
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "returning");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: "requestRejected",
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //query order history theo order code va status = returning
      // === 0 ->>> notif to customer
      // === 1 ->>> notif cus + supp

      // console.log(requestReturnTime);
      //send notif to customer
      if (requestReturnTime.length === 1) {
        let customerObj;
        let accountIdCus;
        if (type === "retail") {
          customerObj = await Order.query()
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerid)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerid)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdCus.accountid,
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
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerid)
            .first();
        } else {
          customerObj = await CampaignOrder.query()
            .select("customerid")
            .where("id", orderId)
            .first();
          accountIdCus = await Customers.query()
            .select("accountid")
            .where("id", customerObj.customerid)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdCus.accountid,
          link: orderCode,
          message: "changed to " + "requestRejected",
          status: "unread",
        });

        //send notif for supp
        if (type === "retail") {
          let suppId = await Order.query()
            .select("supplierid")
            .where("id", orderId)
            .first();
          let accountIdSupp = await Suppliers.query()
            .select("accountid")
            .where("id", suppId.supplierid)
            .first();

          notif.sendNotiForWeb({
            userid: accountIdSupp.accountid,
            link: orderCode,
            message: "changed to " + "requestRejected",
            status: "unread",
          });
        } else {
          let supplierDataForCampaign = await Products.query()
            .select("products.supplierid")
            .join("campaignorder", "campaignorder.productid", "products.id")
            .where("campaignorder.id", orderId)
            .first();
          let supp = await Suppliers.query()
            .select("accountid")
            .where("id", supplierDataForCampaign.supplierid)
            .first();
          notif.sendNotiForWeb({
            userid: supp.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "delivered");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "delivered");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for supp
      if (type === "retail") {
        let suppId = await Order.query()
          .select("supplierid")
          .where("id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", suppId.supplierid)
          .first();

        notif.sendNotiForWeb({
          userid: accountIdSupp.accountid,
          link: orderCode,
          message: "changed to " + status,
          status: "unread",
        });
      } else {
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierid")
          .join("campaignorder", "campaignorder.productid", "products.id")
          .where("campaignorder.id", orderId)
          .first();
        let supp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForCampaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: supp.accountid,
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
        .where("ordercode", orderCode)
        .andWhere("status", "returning");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "returning");
      }
      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
        });
      }
      orderStatusHistoryController.createHistory({
        statushistory: status,
        type: type,
        retailorderid: type === "retail" ? orderId : null,
        campaignorderid: type === "campaign" ? orderId : null,
        // image: JSON.stringify(image),
        ordercode: orderCode,
        description: description,
      } as OrderStatusHistory);
      //send notif for customer
      let customerObj;
      let accountIdCus;
      if (type === "retail") {
        customerObj = await Order.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      } else {
        customerObj = await CampaignOrder.query()
          .select("customerid")
          .where("id", orderId)
          .first();
        accountIdCus = await Customers.query()
          .select("accountid")
          .where("id", customerObj.customerid)
          .first();
      }
      notif.sendNotiForWeb({
        userid: accountIdCus.accountid,
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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = orders.supplierid),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.customerid", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierid",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierid), 
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = campaigns.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = campaigns.supplierid),
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
        .where("campaignorder.status", status)
        .andWhere("campaignorder.customerid", userId)
        .groupBy("campaignorder.id")
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
          Order.raw(`(select customers.firstname as customerfirstname from customers where customers.id = orders.customerid),
           (select customers.lastname as customerlastname from customers where customers.id = orders.customerid),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.supplierid", userId)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          CampaignOrder.raw(
            `(select customers.firstname as customerfirstname from customers where customers.id = campaignorder.customerid),
            (select customers.lastname as customerlastname from customers where customers.id = campaignorder.customerid),
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
        .where("campaigns.supplierid", userId)
        .groupBy("campaignorder.id");

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
          Order.raw(`(select customers.firstname as customerfirstname from customers where customers.id = orders.customerid),
           (select customers.lastname as customerlastname from customers where customers.id = orders.customerid),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details, json_agg(to_jsonb(orderstatushistory) - 'retailorderid') as orderstatushistory`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .join(
          "orderstatushistory",
          "orderstatushistory.retailorderid",
          "orders.id"
        )
        .where("orders.supplierid", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          CampaignOrder.raw(
            `(select customers.firstname as customerfirstname from customers where customers.id = campaignorder.customerid),
            (select customers.lastname as customerlastname from customers where customers.id = campaignorder.customerid),
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
        .join("campaigns", "campaigns.id", "campaignorder.campaignid")
        .join(
          "orderstatushistory",
          "orderstatushistory.campaignorderid",
          "campaignorder.id"
        )
        .where("campaigns.supplierid", userId)
        .andWhere("campaignorder.status", status)
        .groupBy("campaignorder.id");

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
            `(select customers.firstname as customerfirstname from customers where customers.id = campaignorder.customerid),
          (select customers.lastname as customerlastname from customers where customers.id = campaignorder.customerid),
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
        .where("campaigns.supplierid", userId)
        .andWhere("campaigns.id", campaignId)
        .groupBy("campaignorder.id");

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
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.customerid", userId)
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
        .join("suppliers", "suppliers.id", "categories.supplierid")
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
        isShare = false,
        currentPrice = 0
      } = req.body;

      if (!isAdvanced) {
        await Order.query()
          .update({
            paymentid: vnp_TxnRef,
            status: status,
          })
          .where("id", orderId);

        orderStatusHistoryController.createHistory({
          retailorderid: type === "retail" ? orderId : null,
          campaignorderid: type === "campaign" ? orderId : null,
          statushistory: "created",
          ordercode: orderCode,
          type: type,
          description: "is created",
        } as OrderStatusHistory);

        let supplierDataForRetail;
        let supplierDataForCampaign;
        let accountIdSupp;
        if (type === "retail") {
          supplierDataForRetail = await Order.query()
            .select("supplierid")
            .where("id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountid")
            .where("id", supplierDataForRetail.supplierid)
            .first();
        } else {
          supplierDataForCampaign = await Products.query()
            .select("products.supplierid")
            .join("campaignorder", "campaignorder.productid", "products.id")
            .where("campaignorder.id", orderId)
            .first();
          accountIdSupp = await Suppliers.query()
            .select("accountid")
            .where("id", supplierDataForCampaign.supplierid)
            .first();
        }
        notif.sendNotiForWeb({
          userid: accountIdSupp.accountid,
          link: orderCode,
          message: "changed to " + "created",
          status: "unread",
        });

        await CampaignOrder.query()
          .update({ paymentid: vnp_TxnRef, status: status })
          .where("id", orderId);
      } else {
        await CampaignOrder.query()
          .update({
            advancedid: vnp_TxnRef,
            status: status,
            advancefee: amount,
          })
          .where("id", orderId);

        orderStatusHistoryController.createHistory({
          retailorderid: type === "retail" ? orderId : null,
          campaignorderid: type === "campaign" ? orderId : null,
          statushistory: "advanced",
          ordercode: orderCode,
          type: "campaign",
          description: "has completed advanced payment via VNPAY E-Wallet",
        } as OrderStatusHistory);
        // TODO
        //type = campaign
        let supplierDataForCampaign = await Products.query()
          .select("products.supplierid")
          .join("campaignorder", "campaignorder.productid", "products.id")
          .where("campaignorder.id", orderId)
          .first();
        let accountIdSupp = await Suppliers.query()
          .select("accountid")
          .where("id", supplierDataForCampaign.supplierid)
          .first();
        notif.sendNotiForWeb({
          userid: accountIdSupp.accountid,
          link: orderCode,
          message: "changed to " + "advanced",
          status: "unread",
        });

        const order = await CampaignOrder.query()
          .select()
          .where("id", orderId)
          .first();
        const campaignId = order.campaignid;
        // const campaignToUpdateQuantity = await Campaigns.query().select()
        //   .where('id', campaignId).first();
        // const reduceProductQuantity = await Products.query().update({
        //   quantity: Products.raw(`quantity - ${order.quantity}`)
        // })
        //   .where('id', campaignToUpdateQuantity.productid)

        const ordersInCampaign: any = await CampaignOrder.query()
          .select()

          .where("campaignid", campaignId)
          .andWhere("status", "advanced");

        const currentQuantity = ordersInCampaign.reduce(
          (acc: any, curr: any) => parseInt(acc) + parseInt(curr.quantity),
          0
        );
        let campaign;
        if (isShare) {
          campaign = await Campaigns.query()
            .select()
            .where("id", campaignId)
            .andWhere("maxquantity", "<=", currentQuantity)
            .first();
        } else {
          campaign = await Campaigns.query()
            .select()
            .where("id", campaignId)
            .andWhere("quantity", "<=", currentQuantity)
            .first();
        }
        if (campaign) {
          // let dataSuppId = await Products.query().select('categories.supplierid')
          //   .join('categories', 'products.categoryid', 'categories.id')
          //   .where('products.id', campaign.productid).first();
          if (isShare) {
            // const loyalCustomerId = await LoyalCustomer.query().select('customerid').where('supplierid', dataSuppId.supplierid);
            for (const item of ordersInCampaign) {
              let discountPrice = (item.totalprice) - (currentPrice * (item.quantity));
              discountPrice += (discountPrice * item.loyalcustomerdiscountpercent) / 100;
              let updateCampaignOrder: any = await CampaignOrder.query().update({
                discountprice: discountPrice
              })
                .where('id', item.id);
            }
          }
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

            notif.sendNotiForWeb({
              userid: customer.accountid,
              link: item.ordercode,
              message: `campaign with code: ${campaign.code} is done`,
              status: "unread",
            });

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
            link: null,
            message: `campaign with code: ${campaign.code} is done`,
            status: "unread",
          });
        }
      }

      //insert data vào order history
      // if (status === "created") {

      // } else if (status === "advanced") {
      //   if (isAdvanced) {

      //   } else {
      //     orderStatusHistoryController.createHistory({
      //       retailorderid: type === "retail" ? orderId : null,
      //       campaignorderid: type === "campaign" ? orderId : null,
      //       statushistory: "advanced",
      //       ordercode: orderCode,
      //       type: "campaign",
      //       description: "has completed full payment via VNPAY E-Wallet",
      //     } as OrderStatusHistory);

      //     //insert send notif
      //     let supplierDataForCampaign = await Products.query()
      //       .select("products.supplierid")
      //       .join("campaignorder", "campaignorder.productid", "products.id")
      //       .where("campaignorder.id", orderId)
      //       .first();
      //     let accountIdSupp = await Suppliers.query()
      //       .select("accountid")
      //       .where("id", supplierDataForCampaign.supplierid)
      //       .first();
      //     notif.sendNotiForWeb({
      //       userid: accountIdSupp.accountid,
      //       link: orderCode,
      //       message: "changed to " + "advanced",
      //       status: "unread",
      //     });
      //   }
      // }

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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = orders.supplierid),
             json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierid",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierid), 
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = campaigns.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = campaigns.supplierid),
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
        .where("campaignorder.status", status)
        .groupBy("campaignorder.id")
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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = orders.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = orders.supplierid),
             json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.ordercode", orderCode)
        .groupBy("orders.id")
        .first();
      // console.log(orderRetail.customerid)
      const orderCampaign: any = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierid",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierid), 
            (select suppliers.avt as supplieravatar from suppliers where suppliers.id = campaigns.supplierid),
            (select suppliers.address as supplieraddress from suppliers where suppliers.id = campaigns.supplierid),
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
        .where("campaignorder.ordercode", orderCode)
        .groupBy("campaignorder.id")
        .groupBy("campaigns.id")
        .first();
      // console.log(orderCampaign)
      if (orderRetail) {
        customerId = await Customers.query()
          .select("accountid")
          .where("id", orderRetail.customerid)
          .first();
        supplierId = await Suppliers.query()
          .select("accountid")
          .where("id", orderRetail.supplierid)
          .first();
      } else {
        customerId = await Customers.query()
          .select("accountid")
          .where("id", orderCampaign.customerid)
          .first();
        supplierId = await Suppliers.query()
          .select("accountid")
          .where("id", orderCampaign.supplierid)
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
