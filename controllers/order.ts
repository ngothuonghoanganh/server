import { Order } from "../models/orders";
import { OrderDetail } from "../models/orderdetail";

import crypto from "crypto";
class OrderController {
  public createOrder = async (req: any, res: any, next: any) => {
    try {
      let {
        campaignId,
        addressId = null,
        paymentId = null,
        discountPrice = "",
        shippingFee = "",
        products,
        supplierId,
        isWholeSale = false,
        customerDiscountCodeId = null,
        // notes = "",
      } = req.body;

      let orderCode = crypto.randomBytes(5).toString("hex") + `-${Date.now()}`;
      console.log(
        products
          .map((item: any) => item.totalPrice)
          .reduce((prev: any, next: any) => {
            return prev + next;
          })
      );
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
        status: "created",
        totalprice: products
          .map((item: any) => item.totalPrice)
          .reduce((prev: any, next: any) => {
            return prev + next;
          }),
        ordercode: orderCode,
      });

      const details = [];

      for (const product of products) {
        details.push({
          productid: product.productId,
          productname: product.productName,
          quantity: product.quantity,
          price: product.price,
          totalprice: product.totalPrice,
          notes: product.notes,
          typeofproduct: product.typeOfProduct,
          ordercode: orderCode,
          orderid: newOrder.id,
        });
      }

      const newOrderDetails = await OrderDetail.query().insert(details);

      return res.status(200).send({
        message: "successful",
        data: { ...newOrder, details: newOrderDetails },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusOfOrderToCancelledForCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "cancelled", orderCode } = req.body;

      const currentStatus: any = await Order.query()
        .select("status")
        .where("ordercode", orderCode);
      // console.log(currentStatus)
      var picked = currentStatus.find(
        (o: { status: string }) =>
          o.status === "created" || o.status === "advanced"
      );
      // console.log(picked.status === 'created')
      if (picked) {
        const updateStatus: any = await Order.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode);
      }
      res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  //ham nay chua valid status in body is only completed or returned
  public updateStatusOfOrderToCompletedOrReturnedForCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status, orderCode } = req.body;

      const currentStatus: any = await Order.query()
        .select("status")
        .where("ordercode", orderCode);
      var picked = currentStatus.find(
        (o: { status: string }) => o.status === "delivered"
      );
      // console.log(picked)
      if (picked) {
        const updateStatus: any = await Order.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode);
      }
      res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusToCancelledForSupplierAndInspector = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "cancelled", orderCode } = req.body;

      const update: any = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode);

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusToProcessingForSupplier = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "processing", orderCode } = req.body;

      const update: any = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode);

      return res.status(200).send({
        message: "successful",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusForDelivery = async (req: any, res: any, next: any) => {
    try {
      let { status, orderCode } = req.body;

      const update: any = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode);

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
          Order.raw(`json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
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
          Order.raw(`json_agg(to_jsonb(orderdetail) - 'orderid') as details`)
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
}

export default new OrderController();
