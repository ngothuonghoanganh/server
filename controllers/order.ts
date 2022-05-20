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
import { Suppliers } from "../models/suppliers";
import { Customers } from "../models/customers";
import notif from "../services/realtime/notification";
import dbEntity from "../services/dbEntity";
import { firestore } from "firebase-admin";

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
        customerDiscountCodeId = null,
        paymentMethod = "cod",
        loyalcustomerdiscountpercent = 0,
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
          address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
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
          loyalCustomerDiscountPercent: loyalcustomerdiscountpercent,
          quantity: products[0].quantity,
          price: products[0].price,
          note: products[0].notes,
        });

        for (const product of products) {
          await firestore().collection('carts').where('id', '==', product.cartId).get().then(rs => {
            rs.forEach(element => {
              element.ref.delete()
            })
          })
        }
        const transaction = await Transaction.query()
          .select()
          .where("supplierId", supplierId)
          .andWhere("type", "totalIncome")
          .andWhere("status", "active")
          .first();

        if (!transaction)
          transactionController.createTransaction({
            // ordercode: orderCode,
            isWithdrawable: false,
            type: "totalIncome",
            supplierId: supplierId,
          } as Transaction);

        return res.status(200).send({
          message: "successful",
          data: { ...newOrder },
        });
      }

      const newOrder = await Order.query().insert({
        customerId: req.user.id,
        customerDiscountCodeId: customerDiscountCodeId,
        paymentId: paymentId,
        discountPrice: discountPrice,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
        status: paymentMethod === "cod" ? "created" : "unpaid",
        loyalCustomerDiscountPercent: loyalcustomerdiscountpercent,
        totalPrice: products
          .map((item: any) => item.totalPrice)
          .reduce((prev: any, next: any) => {
            return prev + next;
          }),
        orderCode: orderCode,
        address: address?.street + " " + address?.province,
      });
      let newOrderDetails: any = [];
      const details = [];

      for (const product of products) {
        details.push({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
          totalPrice: product.totalPrice,
          note: product.notes,
          orderCode: orderCode,
          image: product.image,
          orderId: newOrder.id,
        });
        await Products.query()
          .update({
            quantity: Products.raw(`
                quantity - ${product.quantity}
              `),
          })
          .where("id", product.productId);

        await firestore().collection('carts').where('id', '==', product.cartId).get().then(rs => {
          rs.forEach(element => {
            element.ref.delete()
          })
        })
      }

      newOrderDetails = await OrderDetail.query().insert(details);

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
          message: "Order " + newOrder.orderCode + " has been set to created",
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
          message: "Order " + newOrder.orderCode + " has been set to unpaid",
          status: "unread",
        });
      }

      const transaction = await Transaction.query()
        .select()
        .where("supplierId", supplierId)
        .andWhere("type", "totalIncome")
        .andWhere("status", "active")
        .first();

      if (!transaction)
        transactionController.createTransaction({
          isWithdrawable: false,
          type: "totalIncome",
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

      return res.status(400).send({ message: error });

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
            ...dbEntity.orderEntity,
            Order.raw(
              `json_agg(to_jsonb("orderDetails") - 'orderId') as details,
              sum("orderDetails".quantity) as orderquantity`
            )
          )
          .join("orderDetails", "orders.id", "orderDetails.orderId")
          .where("orders.orderCode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            ...dbEntity.campaignOrderEntity,
            "campaignOrders.quantity as orderquantity",
            "campaigns.productId as productid"
          )
          .join("campaigns", "campaigns.id", `campaignOrders.campaignId`)
          .where("campaignOrders.orderCode", orderCode)
          .first());

      // console.log(productId);
      let productId = order.campaignid
        ? order.productid
        : order.details[0].productId;

      const supp: any = await Products.query()
        .select("categories.supplierId as supplierid")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", productId)
        .first();
      if (order) {
        const loyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerId", order.customerid)
          .andWhere("supplierId", supp.supplierid)
          .first();

        if (!loyalCustomer) {
          await LoyalCustomer.query().insert({
            customerId: order.customerid,
            supplierId: supp.supplierid,
            numOfOrder: 1,
            numOfProduct: order.orderquantity,
            discountPercent: 0
          });
        } else {
          await LoyalCustomer.query()
            .update({
              customerId: order.customerid,
              supplierId: supp.supplierid,
              numOfOrder: LoyalCustomer.raw(`"numOfOrder" + 1`),
              numOfProduct: LoyalCustomer.raw(
                `"numOfProduct" + ${order.orderquantity}`
              ),
            })
            .where("id", loyalCustomer.id);
        }

        const newLoyalCustomer = await LoyalCustomer.query()
          .select()
          .where("customerId", order.customerid)
          .andWhere("supplierId", supp.supplierid)
          .andWhere("status", "active")
          .first();

        if (newLoyalCustomer) {
          const condition = await LoyalCustomerCondition.query()
            .select()
            .where("supplierId", supp.supplierid)
            .andWhere((cd) => {
              cd.where("minOrder", "<=", newLoyalCustomer.numOfOrder).orWhere(
                "minProduct",
                "<=",
                newLoyalCustomer.numOfProduct
              );
            });

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
        // ordercode: order.ordercode,
        supplierId: supp.supplierid,
        advanceFee: Transaction.raw(`"advanceFee" + ${order.advancefee || 0}`),
        platformFee: Transaction.raw(
          `"platformFee" + ${((order.totalprice - (order.discountprice || 0)) * 2) / 100
          }`
        ),
        paymentFee: Transaction.raw(
          `"paymentFee" + ${((order.totalprice - (order.discountprice || 0)) * 2) / 100
          }`
        ),
        orderValue: Transaction.raw(
          `"orderValue" + ${order.totalprice -
          (order.discountprice || 0) -
          (order.advancefee || 0)
          }`
        ),
        isWithdrawable: true,
        type: "totalIncome",
        description:
          "The order is completed. Vendor is able to withdraw money.",
        status: "active",
      } as any);

      transactionController.createTransaction({
        orderCode: order.ordercode,
        supplierId: supp.supplierid,
        advanceFee: order.advancefee || 0,
        platformFee: ((order.totalprice - (order.discountprice || 0)) * 2) / 100,
        paymentFee: ((order.totalprice - (order.discountprice || 0)) * 2) / 100,
        orderValue: order.totalprice -
          (order.discountprice || 0) -
          (order.advancefee || 0),
        isWithdrawable: false,
        type: "orderTransaction",
        description: `${order.ordercode} is completed.`,
        status: "active",
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
      const accountIdSupp = await Suppliers.query()
        .select("accountId")
        .where("id", supp.supplierid)
        .first();

      notif.sendNotiForWeb({
        userId: accountIdSupp.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
          .select("accountId")
          .where("id", customerObj.customerId)
          .first();
      }
      notif.sendNotiForWeb({
        userId: accountIdCus.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: updateStatus,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
      const order: any =
        (await Order.query().select().where("orderCode", orderCode).first()) ||
        (await CampaignOrder.query()
          .select()
          .where("orderCode", orderCode)
          .first());
      if (cancelLinkRequestor === "Supplier") {
        if (order && order.status === "processing") {
          transactionController.createTransaction({
            description:
              "charge money because Supplier cancel order in status: processing",
            isWithdrawable: false,
            type: "penalty",
            supplierId: supplierId,
            penaltyFee: (order.totalprice || 0) * 0.2,
            orderCode: orderCode || null,
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
      //re-check quantity again for share campaign, reset price if it needs
      if (order.campaignId !== undefined) {
        const campaign = await Campaigns.query().select().where('id', order.campaignId).first();
        if (campaign.isShare) {
          var obj = JSON.parse(campaign.range as any);
          obj.sort(function (a: any, b: any) { return a.quantity - b.quantity });
          const allOrdersInCampaign: any = await CampaignOrder.query().select().where('campaignId', order.campaignId).andWhere('status', 'advanced');
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

      //insert history for cancel
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
      //supplier cancel order
      if (cancelLinkRequestor !== "Customer") {
        orderStatusHistoryController.createHistory({
          orderStatus: "requestRefund",
          type: type,
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          // image: JSON.stringify(image),
          orderCode: orderCode,
          description: "waiting for refund",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
          link: orderCode,
          message:
            "Order has been set to " +
            status +
            ". \n Your online payment (if applicable) will be refunded. ",
          status: "unread",
        });
      } else if (type === "retail") {
        //customer cancel order retail
        orderStatusHistoryController.createHistory({
          orderStatus: "requestRefund",
          type: type,
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          // image: JSON.stringify(image),
          orderCode: orderCode,
          description: "waiting for refund",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
          link: orderCode,
          message:
            "Order has been set to " +
            status +
            ". \n Your online payment (if applicable) will be refunded. ",
          status: "unread",
        });
      } else if (order.status === "created" || order.status === "processing") {
        //customer cancel order campaign in status = created or processing
        orderStatusHistoryController.createHistory({
          orderStatus: "requestRefund",
          type: type,
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          // image: JSON.stringify(image),
          orderCode: orderCode,
          description: "waiting for refund",
        } as OrderStatusHistory);
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
          link: orderCode,
          message:
            "Order has been set to " +
            status +
            ". \n Your online payment (if applicable) will be refunded. ",
          status: "unread",
        });
      } else {
        //customer cancel campaign
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
          link: orderCode,
          message: "Order has been set to " + status,
          status: "unread",
        });
      }

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
      return res.status(400).send({ message: error });
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
        userId: accountIdCus.accountId,
        link: orderCode,
        message: "Order has been set to " + status,
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
        supplierId,
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
        userId: accountIdCus.accountId,
        link: orderCode,
        message: "Order has been set to " + status,
        status: "unread",
      });

      //send notif for supp
      let accountIdSupp = await Suppliers.query()
        .select("accountId")
        .where("id", supplierId)
        .first();

      notif.sendNotiForWeb({
        userId: accountIdSupp.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
        supplierId,
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
        userId: accountIdCus.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });

      //send notif for supp

      let accountIdSupp = await Suppliers.query()
        .select("accountId")
        .where("id", supplierId)
        .first();

      notif.sendNotiForWeb({
        userId: accountIdSupp.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public updateStatusFromReturningToDeliveredForRejectReturn = async (
    req: any,
    res: any
  ) => {
    try {
      let { orderCode, type, orderId, description, image, supplierId } =
        req.body;
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

      // console.log(requestReturnTime);
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
            .select("accountId")
            .where("id", customerObj.customerId)
            .first();
        }
        notif.sendNotiForWeb({
          userId: accountIdCus.accountId,
          link: orderCode,
          message: "Order " + orderCode + " changed to " + "requestRejected",
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
          userId: accountIdCus.accountId,
          link: orderCode,
          message: "Order " + orderCode + " changed to " + "requestRejected",
          status: "unread",
        });

        //send notif for supp
        let accountIdSupp = await Suppliers.query()
          .select("accountId")
          .where("id", supplierId)
          .first();

        notif.sendNotiForWeb({
          userId: accountIdSupp.accountId,
          link: orderCode,
          message:
            "Return request for order " + orderCode + " has been rejected",
          status: "unread",
        });
      }

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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

      const order: any =
        (await Order.query()
          .select(
            ...dbEntity.orderEntity,
            Order.raw(
              `json_agg(to_jsonb("orderDetails") - 'orderId') as details,
            sum("orderDetails".quantity) as orderquantity`
            )
          )
          .join("orderDetails", "orders.id", "orderDetails.orderId")
          .where("orders.orderCode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            ...dbEntity.campaignOrderEntity,
            "campaignOrders.quantity as orderquantity",
            "campaigns.productId as productid"
          )
          .join("campaigns", "campaigns.id", `campaignOrders.campaignId`)
          .where("campaignOrders.orderCode", orderCode)
          .first());

      // console.log(productId);
      let productId = order.campaignid
        ? order.productid
        : order.details[0].productId;

      const supp: any = await Products.query()
        .select("categories.supplierId as supplierid")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", productId)
        .first();
      //send notif for supp
      let suppAcc = await Suppliers.query()
        .select("accountId")
        .where("id", supp.supplierid)
        .first();
      notif.sendNotiForWeb({
        userId: suppAcc.accountId,
        link: orderCode,
        message: "Order " + orderCode + " has been set to " + status,
        status: "unread",
      });

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
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
      const order: any =
        (await Order.query().select().where("orderCode", orderCode).first()) ||
        (await CampaignOrder.query()
          .select()
          .where("orderCode", orderCode)
          .first());
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

      //send notif for customer
      let accountIdCus;
      accountIdCus = await Customers.query()
        .select("accountId")
        .where("id", order.customerId)
        .first();

      orderStatusHistoryController.createHistory({
        orderStatus: status,
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        orderCode: orderCode,
        description: description,
      } as OrderStatusHistory);

      orderStatusHistoryController.createHistory({
        orderStatus: "requestRefund",
        type: type,
        retailOrderId: type === "retail" ? orderId : null,
        campaignOrderId: type === "campaign" ? orderId : null,
        orderCode: orderCode,
        description: "waiting for refund",
      } as OrderStatusHistory);
      notif.sendNotiForWeb({
        userId: accountIdCus.accountId,
        link: orderCode,
        message:
          "Order has been set to " +
          status +
          ". \n Your online payment (if applicable) will be refunded. ",
        status: "unread",
      });
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOrderForCustomer = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const status = req.query.status;

      const orders: any = await Order.query()
        .select(
          ...dbEntity.supplierEntity,
          ...dbEntity.orderEntity,
          // ...dbEntity.orderDetailEntity
          Order.raw(
            // `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierId),
            // (select suppliers.avt as supplieravatar from suppliers where suppliers.id = orders.supplierId),
            // (select suppliers.address as supplieraddress from suppliers where suppliers.id = orders.supplierId),
            `json_agg(to_jsonb("orderDetails") - 'orderId') as details`
          )
        )
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .join('products', 'products.id', "orderDetails.productId")
        .join('categories', 'categories.id', 'products.categoryId')
        .join('suppliers', 'suppliers.id', "categories.supplierId")
        .where("orders.customerId", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id")
        .groupBy("suppliers.id")
      // .groupBy("orderDetails.id")


      const ordersInCampaign = await CampaignOrder.query()
        .select(
          ...dbEntity.supplierEntity,
          ...dbEntity.campaignOrderEntity,
          CampaignOrder.raw(
            `array_to_json(array_agg(json_build_object(
            'id','',
            'image', "campaigns"."image",
            'price', "campaignOrders"."price",
            'quantity', "campaignOrders"."quantity",
            'orderCode', "orderCode",
            'productId', "campaigns"."productId",
            'totalPrice', "totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders"."note")
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .join('products', 'products.id', "campaigns.productId")
        .join('categories', 'categories.id', 'products.categoryId')
        .join('suppliers', 'suppliers.id', "categories.supplierId")
        .where("campaignOrders.status", status)
        .andWhere("campaignOrders.customerId", userId)
        .groupBy("campaignOrders.id")
        .groupBy("suppliers.id")

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
      // const userId = req.user.id;
      let prods = await Products.query()
        .select()
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        .where("categories.supplierId", req.user.id);

      const productIds = prods.map((item: any) => item.id);

      const orders: any = await Order.query()
        .select(
          ...dbEntity.orderEntity,
          Order.raw(`(select "customers"."firstName" as customerfirstname from customers where customers.id = orders."customerId"),
           (select "customers"."lastName" as customerlastname from customers where customers.id = orders."customerId"),
            json_agg(to_jsonb("orderDetails") - 'orderId') as details`)
        )
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .whereIn("orderDetails.productId", productIds)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          ...dbEntity.campaignOrderEntity,
          CampaignOrder.raw(
            `(select "customers"."firstName" as customerfirstname from customers where customers.id = "campaignOrders"."customerId"),
            (select "customers"."lastName" as customerlastname from customers where customers.id = "campaignOrders"."customerId"),
            array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', campaigns.image,
            'price', campaigns.price,
            'quantity', "campaignOrders".quantity,
            'orderCode', "campaignOrders"."orderCode",
            'productId', campaigns."productId",
            'campaignId', "campaignOrders"."campaignId",
            'inCampaign', true,
            'customerId', "campaignOrders"."customerId",
            'totalPrice', "campaignOrders"."totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders".note)
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .whereIn("campaigns.productId", productIds)
        .andWhere('campaignOrders.status', '<>', 'notAdvanced')
        .groupBy("campaignOrders.id");

      orders.push(...ordersInCampaign);

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOrderForSupplierByStatus = async (req: any, res: any) => {
    try {
      // const userId = req.user.id;
      const status = req.query.status;

      let prods = await Products.query()
        .select()
        .leftOuterJoin("categories", "categories.id", "products.categoryId")
        .where("categories.supplierId", req.user.id);

      const productIds = prods.map((item: any) => item.id);

      const orders: any = await Order.query()
        .select(
          ...dbEntity.orderEntity,
          Order.raw(`(select "customers"."firstName" as customerfirstname from customers where customers.id = orders."customerId"),
          (select "customers"."lastName" as customerlastname from customers where customers.id = orders."customerId"),
           json_agg(to_jsonb("orderDetails") - 'orderId') as details, json_agg(to_jsonb("orderStatusHistories") - 'retailOrderId') as orderstatushistory`)
        )
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .join(
          "orderStatusHistories",
          "orderStatusHistories.retailOrderId",
          "orders.id"
        )
        .whereIn("orderDetails.productId", productIds)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          ...dbEntity.campaignOrderEntity,
          CampaignOrder.raw(
            `(select "customers"."firstName" as customerfirstname from customers where customers.id = "campaignOrders"."customerId"),
            (select "customers"."lastName" as customerlastname from customers where customers.id = "campaignOrders"."customerId"),
            array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', campaigns.image,
            'price', campaigns.price,
            'quantity', "campaignOrders".quantity,
            'orderCode', "campaignOrders"."orderCode",
            'productId', campaigns."productId",
            'campaignId', "campaignOrders"."campaignId",
            'inCampaign', true,
            'customerId', "campaignOrders"."customerId",
            'totalPrice', "campaignOrders"."totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders".note)
            )) as details, json_agg(to_jsonb("orderStatusHistories") - 'campaignOrderId') as orderstatushistory`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .join(
          "orderStatusHistories",
          "orderStatusHistories.campaignOrderId",
          "campaignOrders.id"
        )
        .whereIn("campaigns.productId", productIds)
        .andWhere("campaignOrders.status", status)
        .groupBy("campaignOrders.id");

      orders.push(...ordersInCampaign);

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOrderForSupplierAllowCampaign = async (req: any, res: any) => {
    try {
      const campaignId = req.params.campaignId;
      const userId = req.user.id;

      const orders = await CampaignOrder.query()
        .select(
          ...dbEntity.campaignOrderEntity,
          CampaignOrder.raw(
            `(select "customers"."firstName" as customerfirstname from customers where customers.id = "campaignOrders"."customerId"),
            (select "customers"."lastName" as customerlastname from customers where customers.id = "campaignOrders"."customerId"),
            array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', campaigns.image,
            'price', campaigns.price,
            'quantity', "campaignOrders".quantity,
            'orderCode', "campaignOrders"."orderCode",
            'productId', campaigns."productId",
            'campaignId', "campaignOrders"."campaignId",
            'inCampaign', true,
            'customerId', "campaignOrders"."customerId",
            'totalPrice', "campaignOrders"."totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders".note)
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        // .where("campaigns.supplierid", userId)
        .where("campaigns.id", campaignId)
        .andWhere('campaignOrders.status', '<>', 'notAdvanced')
        .groupBy("campaignOrders.id");

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOrderById = async (req: any, res: any) => {
    try {
      const { orderId } = req.params;

      let orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(`json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.id", orderId)
        .groupBy("orders.id");
      if (orders.length === 0) {
        orders = await CampaignOrder.query().select().where("id", orderId);
        console.log(orders);

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
      return res.status(400).send({ message: error });
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
      } = req.body;
      const order: any =
        (await Order.query()
          .select(
            ...dbEntity.orderEntity,
            Order.raw(
              `json_agg(to_jsonb("orderDetails") - 'orderId') as details,
          sum("orderDetails".quantity) as orderquantity`
            )
          )
          .join("orderDetails", "orders.id", "orderDetails.orderId")
          .where("orders.orderCode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            ...dbEntity.campaignOrderEntity,
            "campaignOrders.quantity as orderquantity",
            "campaigns.productId as productid"
          )
          .join("campaigns", "campaigns.id", `campaignOrders.campaignId`)
          .where("campaignOrders.orderCode", orderCode)
          .first());

      // console.log(productId);
      let productId = order.campaignid
        ? order.productid
        : order.details[0].productId;

      const supp: any = await Products.query()
        .select("categories.supplierId as supplierid")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", productId)
        .first();
      const accountIdSupp = await Suppliers.query()
        .select("accountId")
        .where("id", supp.supplierid)
        .first();
      if (!isAdvanced) {
        await Order.query()
          .update({
            paymentId: vnp_TxnRef,
            status: status,
          })
          .where("id", orderId);

        orderStatusHistoryController.createHistory({
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          orderStatus: "created",
          orderCode: orderCode,
          type: type,
          description: "is created",
        } as OrderStatusHistory);

        notif.sendNotiForWeb({
          userId: accountIdSupp.accountId,
          link: orderCode,
          message: "Order " + orderCode + " has been set to created",
          status: "unread",
        });

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

        orderStatusHistoryController.createHistory({
          retailOrderId: type === "retail" ? orderId : null,
          campaignOrderId: type === "campaign" ? orderId : null,
          orderStatus: "advanced",
          orderCode: orderCode,
          type: "campaign",
          description: "has completed advanced payment via VNPAY E-Wallet",
        } as OrderStatusHistory);

        notif.sendNotiForWeb({
          userId: accountIdSupp.accountId,
          link: orderCode,
          message: "Order " + orderCode + " has been set to advanced",
          status: "unread",
        });

        const currentCampaign = await Campaigns.query()
          .select()
          .join("campaignOrders", "campaignOrders.campaignId", "campaigns.id")
          .where("campaignOrders.id", orderId)
          .first();
        const campaignId = currentCampaign.id;

        if (currentCampaign.isShare) {
          // update price for order order in campaign
          const advancedOrdersInCampaign: any = await CampaignOrder.query()
            .select(...dbEntity.campaignOrderEntity)
            .where("campaignId", campaignId)
            .andWhere("status", "advanced")
            .andWhere("id", "<>", orderId);

          // advancedOrdersInCampaign
          // numOfOrder = 3
          // quantity = 60

          if (advancedOrdersInCampaign.length > 0) {
            // const advancedOrder = advancedOrdersInCampaign[0];
            // let discountPrice =
            //   advancedOrder.totalprice - currentPrice * advancedOrder.quantity;
            // discountPrice +=
            //   (currentPrice *
            //     advancedOrder.quantity *
            //     advancedOrder.loyalcustomerdiscountpercent) /
            //   100;
            var obj = JSON.parse(currentCampaign.range as any);
            obj.sort(function (a: any, b: any) { return a.quantity - b.quantity });
            let currentQuantity = advancedOrdersInCampaign.reduce(
              (acc: any, curr: any) => parseInt(acc) + parseInt(curr.quantity),
              0
            );
            let price: any;
            let currentPrice: any;

            // range:
            // 0 id:50, name:80000
            // 1 id:100, name:70000
            // 2 id:150, name:60000
            // 3 id:180, name:50000

            // currentQuantity = 60
            // tổng quantity của các order advanced khác
            // tính giá hiện tại của các order
            if (currentQuantity < obj[0].quantity) {
              price = currentCampaign.price
            } else {
              for (let i = 0; i < obj.length; i++) {
                if (currentQuantity >= obj[i].quantity) {
                  price = obj[i].price;
                }
              }
            }
            console.log(currentQuantity)
            console.log(price)

            // price = 80000

            // vd order.quantity = 60 => currentQuantity = 60 + 60 = 120
            // tổng quantity của các order advanced tính luôn order đang xử lí
            currentQuantity = currentQuantity + order.quantity

            // tính giá sau khi thêm order đang xử lí
            if (currentQuantity < obj[0].quantity) {
              currentPrice = currentCampaign.price
            } else {
              for (let i = 0; i < obj.length; i++) {
                if (currentQuantity >= obj[i].quantity) {
                  currentPrice = obj[i].price;
                }
              }
            }
            console.log(currentQuantity)
            console.log(currentPrice)
            // currentPrice = 70000

            if (currentPrice < price) {
              let discountPrice;
              for (const item of advancedOrdersInCampaign) {
                discountPrice = item.totalprice - currentPrice * item.quantity;
                discountPrice +=
                  (currentPrice *
                    item.quantity *
                    item.loyalcustomerdiscountpercent) /
                  100;
                await CampaignOrder.query()
                  .update({
                    discountPrice: discountPrice,
                  })
                  .where("id", item.id);

                const customer = await Customers.query()
                  .select()
                  .where("id", item.customerid)
                  .first();

                notif.sendNotiForWeb({
                  userId: customer.accountId,
                  link: item.ordercode,
                  message:
                    "Order " + item.ordercode + " has reached a new milestone",
                  status: "unread",
                });
              }
            }
          }
        }

        const ordersInCampaign: any = await CampaignOrder.query()
          .select()
          .where("campaignId", campaignId)
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
            .andWhere("maxQuantity", "<=", currentQuantity)
            .first();
        } else {
          campaign = await Campaigns.query()
            .select()
            .where("id", campaignId)
            .andWhere("quantity", "<=", currentQuantity)
            .first();
        }
        if (campaign) {
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

          // delete all order with status is notAdvanced
          await CampaignOrder.query().del().where('campaignId', campaignId).andWhere('status', 'notAdvanced');
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
              orderStatus:
                item.paymentmethod === "online" ? "unpaid" : "created",
              type: "campaign",
              campaignOrderId: item.id,
              orderCode: item.ordercode,
              description:
                item.paymentmethod === "online"
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
                link: item.ordercode,
                message: "Order " + item.ordercode + " has been set to unpaid",
                status: "unread",
              });
            } else {
              notif.sendNotiForWeb({
                userId: customer.accountId,
                link: item.ordercode,
                message: "Order " + item.ordercode + " has been set to created",
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

          notif.sendNotiForWeb({
            userId: accountIdSupp.accountId,
            link: campaign.code,
            message: `Campaign with code: ${campaign.code} has ended`,
            status: "unread",
          });
        }
      }

      return res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(200).send({
        message: error,
      });
    }
  };

  public getListOrderForDelivery = async (req: any, res: any) => {
    try {
      const status = req.query.status;
      // console.log(status);
      const orders: any = await Order.query()
        .select(
          ...dbEntity.orderEntity,
          Order.raw(
            `(select "customers"."firstName" as customerfirstname from customers where customers.id = orders."customerId"),
            (select "customers"."lastName" as customerlastname from customers where customers.id = orders."customerId"),
             json_agg(to_jsonb("orderDetails") - 'orderId') as details`
          )
        )
        .join("orderDetails", "orders.id", "orderDetails.orderId")
        .where("orders.status", status)
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          ...dbEntity.campaignEntity,
          CampaignOrder.raw(
            `(select "customers"."firstName" as customerfirstname from customers where customers.id = "campaignOrders"."customerId"),
            (select "customers"."lastName" as customerlastname from customers where customers.id = "campaignOrders"."customerId"),
            array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', campaigns.image,
            'price', campaigns.price,
            'quantity', "campaignOrders".quantity,
            'orderCode', "campaignOrders"."orderCode",
            'productId', campaigns."productId",
            'campaignId', "campaignOrders"."campaignId",
            'inCampaign', true,
            'customerId', "campaignOrders"."customerId",
            'totalPrice', "campaignOrders"."totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders".note)
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
        .where("campaignOrders.status", status)
        .groupBy("campaignOrders.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);

      console.log(orders);
      for (const element of orders) {
        const productId = element.details[0].productId;
        const { supplierId }: any = await Products.query()
          .select("categories.supplierId")
          .join("categories", "categories.id", "products.categoryId")
          .where("products.id", productId)
          .first();
        element.supplierid = supplierId;
      }
      return res.status(200).send({
        message: "successful",
        data: { orders: orders },
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOrderByCode = async (req: any, res: any, next: any) => {
    try {
      const orderCode = req.query.orderCode;

      const orders: any =
        (await Order.query()
          .select(
            ...dbEntity.orderEntity,
            Order.raw(
              `json_agg(to_jsonb("orderDetails") - 'orderId') as details`
            )
          )
          .join("orderDetails", "orders.id", "orderDetails.orderId")
          .where("orders.orderCode", orderCode)
          .groupBy("orders.id")
          .first()) ||
        (await CampaignOrder.query()
          .select(
            ...dbEntity.campaignOrderEntity,
            CampaignOrder.raw(
              `array_to_json(array_agg(json_build_object(
            'id', "campaignOrders".id,
            'image', campaigns.image,
            'price', campaigns.price,
            'quantity', "campaignOrders".quantity,
            'orderCode', "campaignOrders"."orderCode",
            'productId', campaigns."productId",
            'campaignId', "campaignOrders"."campaignId",
            'inCampaign', true,
            'customerId', "campaignOrders"."customerId",
            'totalPrice', "campaignOrders"."totalPrice",
            'productName', "campaigns"."productName",
            'note', "campaignOrders".note)
            )) as details`
            )
          )
          .join("campaigns", "campaigns.id", "campaignOrders.campaignId")
          .where("campaignOrders.orderCode", orderCode)
          .groupBy("campaignOrders.id")
          .groupBy("campaigns.id")
          .first());

      if (orders.campaignid) {
        orders.orderstatushistory = await OrderStatusHistory.query()
          .select(...dbEntity.orderStatusHistoriesEntity)
          .where("campaignOrderId", orders.id);
      } else {
        orders.orderstatushistory = await OrderStatusHistory.query()
          .select(...dbEntity.orderStatusHistoriesEntity)
          .where("retailOrderId", orders.id);
      }

      const productId = orders.details[0].productId;
      const { supplierId }: any = await Products.query()
        .select("categories.supplierId")
        .join("categories", "categories.id", "products.categoryId")
        .where("products.id", productId)
        .first();

      const customer = await Customers.query()
        .select(...dbEntity.customerEntity)
        .where("id", orders.customerid)
        .first();
      const supplier = await Suppliers.query()
        .select(...dbEntity.supplierEntity)
        .where("id", supplierId)
        .first();
      return res.status(200).send({
        message: "successful",
        data: {
          order: orders,
          customerId: { ...customer },
          supplierId: { ...supplier },
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}

export default new OrderController();
