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
            typeofproduct: product.typeOfProduct,
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
      // check loyal customer
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

  //trước tien phải để cho customer gửi req muốn trả hàng cho supp, sau đó supp mới nhấn accept mới chuyển status
  //thêm reasonforcancel
  public updateStatusFromDeliveredToReturnedForCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "returned", orderCode } = req.body;

      let update = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "completed");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "completed");
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

  public updateStatusFromCreatedToProcessingForSupplier = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "processing", orderCode } = req.body;

      let update = await Order.query()
        .update({
          status: status,
        })
        .where("ordercode", orderCode)
        .andWhere("status", "created");
      if (update === 0) {
        console.log("update campaign order");
        update = await CampaignOrder.query()
          .update({
            status: status,
          })
          .where("ordercode", orderCode)
          .andWhere("status", "created");
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

  public updateStatusFromCreatedOrProcessingToCancelledForInspectorAndSupplier =
    async (req: any, res: any, next: any) => {
      try {
        const reasonForCancel = req.body.reasonForCancel;
        const imageProof = req.body.imageProof;

        let { status = "cancelled", orderCode } = req.body;
        let update = await Order.query()
          .update({
            status: status,
            reasonforcancel: reasonForCancel,
            imageproof: imageProof
          })
          .where("status", "created")
          .orWhere("status", "processing")
          .andWhere("ordercode", orderCode);
        if (update === 0) {
          console.log("update campaign order");
          update = await CampaignOrder.query()
            .update({
              status: status,
              reasonforcancel: reasonForCancel,
              imageproof: imageProof
            })
            .where("status", "created")
            .orWhere("status", "processing")
            .andWhere("ordercode", orderCode);
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
      }
    };

  public updateStatusFromProcessingToDeliveringForSupplier = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      let { status = "delivering", orderCode } = req.body;

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

      const orders: any = await Order.query()
        .select(
          "orders.*",
          // 'orderdetail.notes as orderdetailnotes',
          Order.raw(`(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),json_agg(to_jsonb(orderdetail) - 'orderid') as details`),

        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where("orders.customerid", userId)
        .andWhere("orders.status", status)
        .groupBy("orders.id")

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          'campaigns.supplierid',
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
        .join('campaigns', 'campaigns.id', 'campaignorder.campaignid')
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

  public getOrderForSupplier = async (req: any, res: any, next: any) => {
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

  public getOrderForSupplierAllowCampaign = async (
    req: any,
    res: any,
    next: any
  ) => {
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

  public getOrderById = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      // console.log(orderId)
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
          notes: orders[0].notes
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

  public paymentOrder = async (req: any, res: any, next: any) => {
    try {
      const { orderId, status, isAdvanced, amount, vnp_TxnRef } = req.body;

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
          .select
          // "orders.id as orderid",
          // Order.raw(`sum(orderdetail.quantity) as orderquantity`)
          ()
          // .join("orderdetail", "orders.id", "orderdetail.orderid")
          .where("campaignid", campaignId)
          .andWhere("status", "advanced");
        // .groupBy("orders.id");
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

          const getCampaigns = await Campaigns.query()
            .select()
            .where("productid", campaign.productid);
          await Campaigns.query()
            .update({ status: "done" })
            .where("id", campaignId);
          if (getCampaigns.length === 0) {
            await Products.query()
              .update({ status: "active" })
              .where("id", campaign.productid);
          }
        }
      }

      // const orderId = req.query.order_id;

      // const order = await Order.query().select().where("id", orderId).first();
      // const campaignId = order.campaignid;
      // await Order.query()
      //   .update({
      //     status: "created",
      //   })
      //   .where("id", orderId)
      //   .andWhere("status", "unpaid");
      // 0;
      // if (
      //   campaignId &&
      //   campaignId !== null &&
      //   campaignId !== undefined &&
      //   campaignId !== ""
      // ) {
      //   await Order.query()
      //     .update({
      //       status: "advanced",
      //     })
      //     .where("id", orderId);

      //   const ordersInCampaign = await Order.query()
      //     .select(
      //       "orders.id as orderid",
      //       Order.raw(`sum(orderdetail.quantity) as orderquantity`)
      //     )
      //     .join("orderdetail", "orders.id", "orderdetail.orderid")
      //     .where("orders.campaignid", campaignId)
      //     .andWhere("status", "advanced")
      //     .groupBy("orders.id");
      //   const currentQuantity = ordersInCampaign.reduce(
      //     (acc: any, curr: any) => parseInt(acc) + parseInt(curr.orderquantity),
      //     0
      //   );
      //   const campaign = await Campaigns.query()
      //     .select()
      //     .where("id", campaignId)
      //     .andWhere("quantity", "<=", currentQuantity)
      //     .first();
      //   if (campaign) {
      //     const orderId = ordersInCampaign.map((item: any) => item.orderid);
      //     await Promise.all([
      //       Order.query()
      //         .update({
      //           status: "unpaid",
      //         })
      //         .whereIn("id", orderId)
      //         .andWhere("paymentmethod", "online"),
      //       Order.query()
      //         .update({
      //           status: "created",
      //         })
      //         .whereIn("id", orderId)
      //         .andWhere("paymentmethod", "cod"),
      //     ]);
      //     await Campaigns.query()
      //       .update({ status: "done" })
      //       .where("id", campaignId);
      // }
      // }

      return res.status(200).send({
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new OrderController();
