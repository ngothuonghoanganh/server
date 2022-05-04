import { OrderDetail } from "../models/orderdetail";
// import { Client } from "../models/redis/index";
import { createClient } from "redis";
import crypto from "crypto";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";

class CartController {
  client = createClient({
   url:"redis://redis:6379"
  });
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
      return res.status(400).send({ message: error });
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
      return res.status(400).send({ message: error });
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
      return res.status(400).send({ message: error });
    }
  };
  //cart.prodictid = products.id
  //suppliers.id = products.supplierid
  public getCartByUserId = async (req: any, res: any, next: any) => {
    try {
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

        Object.assign(element, { ...product, ...supplier });
      }

      await this.client.QUIT();
      res.status(200).send({
        message: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}

export default new CartController();
