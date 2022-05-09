import { OrderDetail } from "../models/orderdetail";

import { createClient } from "redis";
import crypto from "crypto";
import { Products } from "../models/products";
import { Suppliers } from "../models/suppliers";
import { firestore } from "firebase-admin";
import { Cart } from "../models/cart";

class CartController {
  public addToCart = async (req: any, res: any, next: any) => {
    try {
      const customerId = req.user.id;
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

      const cart = await firestore().collection("carts").add(newCart)

      return res.status(200).send({
        message: "successful",
        data: { fireStoreId: cart.id },
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    } finally {

    }
  };

  public updateCart = async (req: any, res: any, next: any) => {
    try {
      const { cartId } = req.params;
      let { productId, quantity } = req.body;

      await firestore().collection('carts').where('id', '==', cartId).get().then(rs => {
        rs.forEach(element => {
          element.ref.update({
            quantity: quantity,
            productid: productId
          })
        })
      })

      return res.status(200).send({
        message: "cart updated",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    } finally {

    }
  };

  public deleteCart = async (req: any, res: any, next: any) => {
    try {
      const { cartId } = req.params;
      await firestore().collection('carts').where('id', '==', cartId).get().then(rs => {
        rs.forEach(element => {
          element.ref.delete()
        })
      })

      return res.status(200).send({
        message: "cart deleted",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    } finally {

    }
  };


  public getCartByUserId = async (req: any, res: any, next: any) => {
    try {

      const data: any = []
      let cartConvert = {
        toFirestore: (data: any) => {
          return {
            campaignid: data.campaignid,
            customerid: data.customerid,
            id: data.id,
            inCampaign: data.inCampaign,
            productid: data.prodictid,
            quantity: data.quantity,
            supplierid: data.supplierid
          }
        },

        fromFirestore: (snapshot: any, options: any) => {
          const data = snapshot.data(options);
          return new Cart(data.campaignid, data.customerid, data.id, data.inCampaign, data.productid, data.quantity, data.supplierid)
        }
      }

      await firestore().collection('carts').withConverter(cartConvert as any)
        .where("customerid", "==", req.user.id)
        .get().then(rs => {
          rs.forEach(element => {
            data.push(element.data())
          })
          console.log(rs)
        })

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




      res.status(200).send({
        message: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    } finally {

    }
  };
}

export default new CartController();
