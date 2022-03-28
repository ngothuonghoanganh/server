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
          productid: products[0].productId,
          productname: products[0].productName,
          quantity: products[0].quantity,
          price: products[0].price,
          notes: products[0].notes,
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
        }
        transactionController.createTransaction({
          ordercode: orderCode,
          iswithdrawable: false,
          type: "income",
          supplierid: supplierId,
        } as Transaction);

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
      } else {
        orderStatusHistoryController.createHistory({
          statushistory: "unpaid",
          type: "retail",
          retailorderid: newOrder.id,
          ordercode: newOrder.ordercode,
          description: "requires full payment via VNPAY E-Wallet",
        } as OrderStatusHistory);
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
        ordercode: orderCode,
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
        ordercode: order.ordercode,
        platformfee:
          ((order.totalprice - (order.discountprice || 0)) * 2) / 100,
        paymentfee: ((order.totalprice - (order.discountprice || 0)) * 2) / 100,
        ordervalue:
          order.totalprice -
          (order.discountprice || 0) -
          (order.advancefee || 0),
        iswithdrawable: true,
        type: "income",
        description:
          "The order is completed. Vendor is able to withdraw money.",
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
        description /*, image*/,
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
        description: description,
      } as OrderStatusHistory);

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
      let { status = "cancelled",
        orderCode,
        type,
        orderId,
        image,
        description, } = req.body;
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
      let { status = "cancelled",
        orderCode,
        type,
        orderId,
        image,
        description } = req.body;
      let update = await Order.query()
        .update({
          status: status,
        })
        .where("status", "created")
        .orWhere("status", "unpaid")
        .orWhere("status", "advanced")
        .orWhere("status", "processing")
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
          .orWhere("status", "processing")
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
        description,
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
        description: description,
      } as OrderStatusHistory);
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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),json_agg(to_jsonb(orderdetail) - 'orderid') as details`
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
        .join('orderstatushistory', 'orderstatushistory.retailorderid', 'campaignorder.id')
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
            )) as details, json_agg(to_jsonb(orderstatushistory) - 'campaignorderid') as orderstatushistory`
          )
        )
        .join("campaigns", "campaigns.id", "campaignorder.campaignid")
        .join('orderstatushistory', 'orderstatushistory.campaignorderid', 'campaignorder.id')
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
      } = req.body;

      if (!isAdvanced) {
        await Order.query()
          .update({
            paymentid: vnp_TxnRef,
            status: status,
          })
          .where("id", orderId);
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

        const order = await CampaignOrder.query()
          .select()
          .where("id", orderId)
          .first();
        const campaignId = order.campaignid;
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
            .where("productid", campaign.productid)
            .andWhere("status", "active");

          if (getCampaigns.length === 0) {
            await Products.query()
              .update({ status: "active" })
              .where("id", campaign.productid);
          }
        }

        transactionController.update({
          ordercode: order.ordercode,
          advancefee: order.advancefee,
          type: "income",
        } as Transaction);
      }

      //insert data vào order history

      if (status === "created") {
        orderStatusHistoryController.createHistory({
          retailorderid: type === "retail" ? orderId : null,
          campaignorderid: type === "campaign" ? orderId : null,
          statushistory: "created",
          ordercode: orderCode,
          type: type,
          description: "is created",
        } as OrderStatusHistory);
      } else if (status === "advanced") {
        if (isAdvanced) {
          orderStatusHistoryController.createHistory({
            retailorderid: type === "retail" ? orderId : null,
            campaignorderid: type === "campaign" ? orderId : null,
            statushistory: "advanced",
            ordercode: orderCode,
            type: "campaign",
            description: "has completed advanced payment via VNPAY E-Wallet",
          } as OrderStatusHistory);
        } else {
          orderStatusHistoryController.createHistory({
            retailorderid: type === "retail" ? orderId : null,
            campaignorderid: type === "campaign" ? orderId : null,
            statushistory: "advanced",
            ordercode: orderCode,
            type: "campaign",
            description: "has completed full payment via VNPAY E-Wallet",
          } as OrderStatusHistory);
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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
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
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
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
