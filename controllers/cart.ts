import { Cart } from "../models/cart";
import { OrderDetail } from "../models/orderdetail";
import { createClient } from "redis";
import crypto from "crypto";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
class CartController {
  client = createClient();

  public addToCart = async (req: any, res: any, next: any) => {
    try {
      const customerId = req.user.id; //customer id

      let {
        productId,
        quantity,
        inCampaign = false,
        campaignId,
        supplierId,
      } = req.body;

      const id = crypto.randomBytes(8).toString("hex") + `-${Date.now()}`;
      const newCart = {
        id: id,
        productid: productId,
        customerid: customerId,
        campaignid: campaignId,
        quantity: quantity,
        inCampaign: inCampaign,
        supplierid: supplierId,
      };

      await this.client.connect();
      let data: any = (await this.client.get(`${req.user.id}`)) || "[]";
      // if (data) {
      data = JSON.parse(data);
      data.push({ ...newCart });
      await this.client.set(`${req.user.id}`, JSON.stringify(data));

      await this.client.QUIT();

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
      let { productId, quantity } = req.body;
      await this.client.connect();
      let data: any = (await this.client.get(`${req.user.id}`)) || "[]";
      // if (data) {
      data = JSON.parse(data);
      for (const element of data) {
        if (element.id === cartId) {
          element.quantity = quantity;
          element.productid = productId;
        }
      }
      await this.client.set(`${req.user.id}`, JSON.stringify(data));
      await this.client.QUIT();

      return res.status(200).send({
        message: "cart updated",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deleteCart = async (req: any, res: any, next: any) => {
    try {
      const { cartId } = req.params;
      await this.client.connect();
      let data: any = (await this.client.get(`${req.user.id}`)) || "[]";
      // if (data) {
      data = JSON.parse(data);
      data.splice(
        data.findIndex((item: any) => item.id === cartId),
        1
      );
      await this.client.set(`${req.user.id}`, JSON.stringify(data));
      await this.client.QUIT();

      return res.status(200).send({
        message: "cart deleted",
      });
    } catch (error) {
      console.log(error);
    }
  };
  //cart.prodictid = products.id
  //suppliers.id = products.supplierid
  public getCartByUserId = async (req: any, res: any, next: any) => {
    try {
      // const { id } = req.user;
      // const listEntity = [

      // ];
      // // console.log(id)
      // const List = await OrderDetail.query()
      //   .select("orderdetail.*", ...listEntity)
      //   .join("products", "orderdetail.productid", "products.id")
      //   .join("suppliers", "suppliers.id", "products.supplierid")
      //   .where("orderdetail.customerid", id)
      //   .andWhere("orderdetail.ordercode", "is", null);
      await this.client.connect();
      let data: any = (await this.client.get(`${req.user.id}`)) || "[]";
      // if (data) {
      data = JSON.parse(data);
      for (const element of data) {
        const [product, supplier] = await Promise.all([
          Products.query()
            .select(
              "products.id as productid",
              "products.name as productname",
              "products.retailPrice as productretailprice",
              "products.quantity as productquantity",
              "products.description as productdescription",
              "products.image as productimage"
            )
            .where("id", element.productid)
            .first(),
          Suppliers.query()
            .select(
              "suppliers.id as supplierid",
              "suppliers.name as suppliername",
              "suppliers.email as supplieremai",
              "suppliers.avt as supplieravt",
              "suppliers.isDeleted as supplierisdeleted",
              "suppliers.address as supplieraddress"
            )
            .where("id", element.supplierid)
            .first(),
        ]);

        element.product = { ...product };
        element.supplier = { ...supplier };
      }

      await this.client.QUIT();
      res.status(200).send({
        message: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new CartController();
