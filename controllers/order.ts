import { Order } from "../models/orders";
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
        // notes = "",
      } = req.body;

      let datas = [];
      let orderCode = crypto.randomBytes(5).toString("hex") + `-${Date.now()}`;
      for (const product of products) {
        datas.push({
          customerid: req.user.id,
          productid: product.productId,
          productname: product.productName,
          quantity: product.quantity,
          iswholesale: product.isWholesale,
          price: product.price,
          typeofproduct: product.typeOfProduct,
          status: "created",
          addressid: addressId,
          customerdiscontcodeid: product.customerDiscountCodeId,
          paymentid: paymentId,
          campaignid: product.isWholesale ? campaignId : null,
          totalprice: product.totalPrice,
          notes: product.notes,
          discountprice: discountPrice / products.length,
          shippingfee: shippingFee / products.length,
          ordercode: orderCode,
        });
      }

      const newProduct = await Order.query().insert(datas);
      return res.status(200).send({
        message: "successful",
        data: newProduct,
      });
    } catch (error) {
      console.log(error);
    }
  };


  public updateStatusOfOrderToCancelledForCustomer = async (req: any, res: any, next: any) => {
    try {
      let {
        status = 'cancelled',
        orderCode
      } = req.body

      const currentStatus: any = await Order.query()
        .select('status')
        .where('ordercode', orderCode)
      // console.log(currentStatus)
      var picked = currentStatus.find((o: { status: string; }) => o.status === 'created' || o.status === 'advanced');
      // console.log(picked.status === 'created')
      if (picked) {
        const updateStatus: any = await Order.query()
          .update({
            status: status
          })
          .where('ordercode', orderCode)
      }
      res.status(200).send({
        message: 'successful'
      })
    } catch (error) {
      console.log(error)
    }
  };

  //ham nay chua valid status in body is only completed or returned
  public updateStatusOfOrderToCompletedOrReturnedForCustomer = async (req: any, res: any, next: any) => {
    try {
      let {
        status,
        orderCode
      } = req.body

      const currentStatus: any = await Order.query()
        .select('status')
        .where('ordercode', orderCode)
      var picked = currentStatus.find((o: { status: string; }) => o.status === 'delivered');
      // console.log(picked)
      if (picked) {
        const updateStatus: any = await Order.query()
          .update({
            status: status
          })
          .where('ordercode', orderCode)
      }
      res.status(200).send({
        message: 'successful'
      })
    } catch (error) {
      console.log(error)
    }
  };

  public updateStatusToCancelledForSupplierAndInspector = async (req: any, res: any, next: any) => {
    try {
      let {
        status = 'cancelled',
        orderCode
      } = req.body

      const update: any = await Order.query()
        .update({
          status: status
        })
        .where('ordercode', orderCode)

      return res.status(200).send({
        message: 'successful',
        data: update
      })
    } catch (error) {
      console.log(error)
    }

  };

  public updateStatusToProcessingForSupplier = async (req: any, res: any, next: any) => {
    try {
      let {
        status = 'processing',
        orderCode
      } = req.body

      const update: any = await Order.query()
        .update({
          status: status
        })
        .where('ordercode', orderCode)

      return res.status(200).send({
        message: 'successful',
        data: update
      })
    } catch (error) {
      console.log(error)
    }
  };

  public updateStatusForDelivery = async (req: any, res: any, next: any) => {
    try {
      let {
        status,
        orderCode
      } = req.body

      const update: any = await Order.query()
        .update({
          status: status
        })
        .where('ordercode', orderCode)

      return res.status(200).send({
        message: 'successful',
        data: update
      })
    } catch (error) {
      console.log(error)
    }

  };

}

export default new OrderController();
