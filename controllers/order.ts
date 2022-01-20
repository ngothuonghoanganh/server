import { Order } from "../models/orders";
import console from "console";

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
          notes: product.notes,
          discountprice: discountPrice / products.length,
          shippingfee: shippingFee / products.length,
        });
      }

      const newProduct = await Order.query().insert(datas);
      // const prod: any = await Order.query().insert({
      //   customerid: customerId,
      //   productid: productId,
      //   productname: productName,
      //   quantity: quantity,
      //   iswholesale: isWholeSale,
      //   price: price,
      //   typeofproduct: typeofproduct,
      //   customerdiscountid: customerDiscountCodeId,
      //   status: status,
      //   campaignid: campaignId,
      //   addressid: addressId,
      //   paymentid: paymentId,
      //   discountprice: discountPrice,
      //   shippingfee: shippingFee,
      //   notes: notes,
      // });
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
