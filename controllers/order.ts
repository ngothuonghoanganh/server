import { Order } from "../models/orders";
import crypto from "crypto";
class OrderController {
  public createOrder = async (req: any, res: any, next: any) => {
    try {
      let {
        // customerId,
        // productId,
        // productName,
        // quantity,
        // price,
        // typeofproduct,
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
}

export default new OrderController();
