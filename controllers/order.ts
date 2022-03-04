import { Order } from "../models/orders";
import { OrderDetail } from "../models/orderdetail";
import { Address } from "../models/address";

import crypto from "crypto";
import { Campaigns } from "../models/campaigns";
import { Products } from "../models/products";
import { LoyalCustomerCondition } from "../models/loyalCustomerCondition";
import { LoyalCustomer } from "../models/loyalCustomer";

class OrderController {
  public createOrder = async (req: any, res: any, next: any) => {
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
      } = req.body;

      const address: Address = await Address.query()
        .select()
        .where("id", addressId)
        .first();

      let orderCode = crypto.randomBytes(5).toString("hex") + `-${Date.now()}`;

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
        status:
          campaignId &&
          campaignId !== null &&
          campaignId !== undefined &&
          campaignId !== ""
            ? "notAdvanced"
            : "unpaid",
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
            typeofproduct: product.typeOfProduct,
            ordercode: orderCode,
            image: product.image,
            orderid: newOrder.id,
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
              typeofproduct: product.typeOfProduct,
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

      for (const product of products) {
        await Products.query()
          .update({
            quantity: Products.raw(`
            quantity - ${product.quantity}
          `),
          })
          .where("id", product.productId);
      }

      return res.status(200).send({
        message: "successful",
        data: { ...newOrder, details: newOrderDetails },
      });
    } catch (error) {
      console.log(error);
    }
  };

  //ham nay chua valid status in body is only completed or returned
  public updateStatusFromDeliveredToCompletedForCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "completed", orderCode } = req.body;

      const update = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "delivered");
      // check loyal customer
      const order: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(`sum(orderdetail.quantity) as orderquantity`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.ordercode", orderCode)
        .groupBy("orders.id")
        .first();
      console.log(order);

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
          const condition =  await LoyalCustomerCondition.query()
            .select()
            .where("supplierid", order.supplierid)
            .andWhere("minorder", "<=", newLoyalCustomer.numoforder)
            .andWhere("minproduct", "<=", newLoyalCustomer.numofproduct);

          const maxPercent = condition.reduce((p: any, c: any) =>
            p.discountpercent > c.discountpercent ? p : c
          );

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
      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusFromDeliveredToReturnedForCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "returned", orderCode } = req.body;

      const update = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "completed");

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
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

  public updateStatusFromCreatedToProcessingForSupplier = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "processing", orderCode } = req.body;

      const update = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "created");

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
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

  public updateStatusFromCreatedOrProcessingToCancelledForInspectorAndSupplier =
    async (req: any, res: any, next: any) => {
      try {
        let { status = "cancelled", orderCode } = req.body;
        const update = await Order.query()
          .update({
            status: status,
          })
          .where("status", "created")
          .orWhere("status", "processing")
          .andWhere("ordercode", orderCode);
        console.log(update);
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
    res: any,
    next: any
  ) => {
    try {
      let { status = "delivering", orderCode } = req.body;

      const update: any = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "processing");

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
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

  public updateStatusFromDeliveringToDeliveredForDelivery = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "delivered", orderCode } = req.body;
      const update: any = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "delivering");

      if (update === 0) {
        return res.status(200).send({
          message: "not yet updated",
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

  public getOrderForCustomer = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id;
      const status = req.query.status;
      const orders = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.customerid", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id");

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForSupplier = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id;

      const orders = await Order.query()
        .select(
          "orders.*",
          Order.raw(`(select customers.firstname as customerfirstname from customers where customers.id = orders.customerid),
           (select customers.lastname as customerlastname from customers where customers.id = orders.customerid),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.supplierid", userId)
        .groupBy("orders.id");

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderForSupplierAllowCampaign = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const campaignId = req.params.campaignId;
      const userId = req.user.id;

      const orders = await Order.query()
        .select(
          "orders.*",
          Order.raw(`(select customers.firstname as customerfirstname from customers where customers.id = orders.customerid),
           (select customers.lastname as customerlastname from customers where customers.id = orders.customerid),
            json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.supplierid", userId)
        .andWhere("orders.campaignid", campaignId)
        .groupBy("orders.id");

      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOrderById = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const orders = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid), json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.customerid", userId)
        .andWhere("orders.id", orderId)
        .groupBy("orders.id");
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public paymentOrder = async (req: any, res: any, next: any) => {
    try {
      const orderId = req.query.order_id;

      const order = await Order.query().select().where("id", orderId).first();
      const campaignId = order.campaignid;

      if (
        campaignId &&
        campaignId !== null &&
        campaignId !== undefined &&
        campaignId !== ""
      ) {
        await Order.query()
          .update({
            status: "advanced",
          })
          .where("id", orderId);

        const ordersInCampaign = await Order.query()
          .select(
            "orders.id as orderid",
            Order.raw(`sum(orderdetail.quantity) as orderquantity`)
          )
          .join("orderdetail", "orders.id", "orderdetail.orderid")
          .where("orders.campaignid", campaignId)
          .andWhere("status", "advanced")
          .groupBy("orders.id");
        const currentQuantity = ordersInCampaign.reduce(
          (acc: any, curr: any) => parseInt(acc) + parseInt(curr.orderquantity),
          0
        );
        console.log(currentQuantity);
        const campaign = await Campaigns.query()
          .select()
          .where("id", campaignId)
          .andWhere("quantity", "<=", currentQuantity)
          .first();
        if (campaign) {
          const orderId = ordersInCampaign.map((item: any) => item.orderid);
          // console.log(orderId)
          await Order.query()
            .update({
              status: "unpaid",
            })
            .whereIn("id", orderId);

          await Campaigns.query()
            .update({ status: "done" })
            .where("id", campaignId);
        }
      }
      await Order.query()
        .update({
          status: "created",
        })
        .where("id", orderId)
        .andWhere("status", "unpaid");
    } catch (error) {
      console.log(error);
    }
  };
}

export default new OrderController();
