import { Cart } from "../models/cart";
import { OrderDetail } from "../models/orderdetail";

class CartController {
  public addToCart = async (req: any, res: any, next: any) => {
    try {
      const customerId = req.user.id; //customer id

      let { productId, quantity,  typeofproduct } = req.body;

      const newCart: any = await OrderDetail.query().insert({
        customerid: customerId,
        productid: productId,
        quantity: quantity,
        typeofproduct: typeofproduct,
      });

      return res.status(200).send({
        message: "successful",
        data: newCart,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateCart = async (req: any, res: any, next: any) => {
    try {
      const { cartId } = req.params;
      let { productId, quantity,  typeofproduct } = req.body;
      const updateCart = await OrderDetail.query()
        .update({
          productid: productId,
          quantity: quantity,
          typeofproduct: typeofproduct,
        })
        .where("id", cartId);
      return res.status(200).send({
        message: "cart updated",
        data: updateCart,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deleteCart = async (req: any, res: any, next: any) => {
    try {
      const { cartId } = req.params;
      // console.log(cartId)
      const deleteCart: any = await OrderDetail.query()
        .where("id", cartId)
        .andWhere("orderdetail.ordercode", "is", null)
        .del();
      return res.status(200).send({
        message: "cart deleted",
        data: deleteCart,
      });
    } catch (error) {
      console.log(error);
    }
  };
  //cart.prodictid = products.id
  //suppliers.id = products.supplierid
  public getCartByUserId = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.user;
      const listEntity = [
        "products.id as productid",
        "products.name as productname",
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
        "products.description as productdescription",
        "products.image as productimage",
        "suppliers.id as supplierid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      // console.log(id)
      const List = await OrderDetail.query()
        .select("orderdetail.*", ...listEntity)
        .join("products", "orderdetail.productid", "products.id")
        .join("suppliers", "suppliers.id", "products.supplierid")
        .where("orderdetail.customerid", id)
        .andWhere("orderdetail.ordercode", "is", null);

      res.status(200).send({
        message: "success",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new CartController();
