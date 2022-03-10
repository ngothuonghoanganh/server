import { Products } from "../models/products";
import console from "console";
import { Suppliers } from "../models/suppliers";
import { Comments } from "../models/comment";
import { rmSync } from "fs";
import { any } from "joi";

class ProductsController {
  public createNewProduct = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.user.id; //supplierid
      // console.log(supplierId)
      let {
        name,
        retailPrice,
        quantity,
        description = "",
        image = "",
        categoryId = null,
        status = "active",
        typeofproduct = "",
      } = req.body;

      const prod: any = await Products.query().insert({
        name: name,
        supplierid: supplierId,
        retailprice: retailPrice,
        quantity: quantity,
        description: description,
        image: JSON.stringify(image),
        categoryid: categoryId,
        status: status,
        typeofproduct: typeofproduct,
      });
      return res.status(200).send({
        message: "successful",
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateProduct = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.user; //supplier id
      const { productId } = req.params;
      let {
        name,
        retailPrice,
        quantity,
        description,
        image,
        categoryId = null,
        status = false,
        typeofproduct = "",
      } = req.body;

      //       if (!retailPrice || !Number.isInteger(retailPrice)) {
      //         return res
      //           .status(400)
      //           .send("Make sure you enter a number for retail price!");
      //       }

      const productUpdated: any = await Products.query()
        .update({
          name: name,
          retailprice: retailPrice,
          categoryid: categoryId,
          quantity: quantity,
          description: description,
          image: JSON.stringify(image),
          typeofproduct: typeofproduct,
        })
        .where("supplierid", id)
        .andWhere("id", productId)
        .andWhere("status", "<>", "incampaign");

      // const productUpdated: any = await Products.query()
      //   .select()
      //   .where("id", productId);
      return res.status(200).send({
        message: "updated product: " + name,
        data: productUpdated,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProductAndSupplierInformation = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const supplierId = req.query.supplierId;
      let ListSupplierEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];

      const List = supplierId
        ? await Products.query()
          .select("products.*", ...ListSupplierEntity)
          // .join('suppliers', 'suppliers.id', 'products.supplierid')
          .join("suppliers", "suppliers.id", "products.supplierid")
          .where("supplierid", supplierId)
          .andWhere("status", "<>", "deactivated")
        : await Products.query()
          .select(...ListSupplierEntity, "products.*")
          .join("suppliers", "suppliers.id", "products.supplierid")
          .where("status", "<>", "deactivated");
      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProductsAndCates = async (req: any, res: any, next: any) => {
    try {
      let listEntity = [
        "products.*",
        "categories.categoryname as categoryname",
        "categories.id as categoryid",
      ];
      let prods = await Products.query()
        .select(...listEntity)
        .leftOuterJoin("categories", "categories.id", "products.categoryid")
        .where("products.status", "<>", "deactivated")
        .andWhere("products.supplierid", req.user.id);

      prods = prods.map((prod: any) => {
        if (prod.image) {
          console.log(prod.image);
          // prod.image = JSON.parse(prod.image);
        }
        return prod;
      });
      return res.status(200).send({
        message: "get success",
        data: prods,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProductsBySupplierId = async (req: any, res: any, next: any) => {
    try {
      let listEntity = [
        "products.*",
        // "categories.categoryname as categoryname",
        // "categories.id as categoryid",
      ];
      const supplierId = req.query.supplierId;

      let prods = await Products.query()
        .select(...listEntity)
        // .leftOuterJoin("categories", "categories.id", "products.categoryid")
        // .where("products.status", "<>", "deactivated")
        .where("products.supplierid", supplierId);

      prods = prods.map((prod: any) => {
        if (prod.image) {
          console.log(prod.image);
          // prod.image = JSON.parse(prod.image);
        }
        return prod;
      });
      // console.log('test')
      return res.status(200).send({
        message: "get success",
        data: prods,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getProductById = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      const listEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const prod: any = await Products.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "products.supplierid")
        .where("products.id", productId)
        .andWhere("products.status", "<>", "deactivated")
        .first();

      console.log(prod);
      return res.status(200).send({
        message: "success",
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  //supplier  or inspector can do it
  public disableProduct = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      await Products.query()
        .update({
          status: "deactivated",
        })
        .where("id", productId)
        .andWhere("status", "active");

      return res.status(200).send({
        message: "Delete Success",
        data: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getRatingByListProducts = async (req: any, res: any, next: any) => {
    try {
      const productIds = req.body.productIds;

      const listRating = await Comments.query()
        .select('productid', Comments.raw(`AVG(rating) as rating`))
        .whereIn('productid', productIds).groupBy("productid")
      return res.status(200).send({
        message: 'successful',
        data: listRating
      })
    } catch (error) {
      console.log(error)
    }
  };

  public searchProduct = async (req: any, res: any, next: any) => {
    try {
      const value = req.body.value;
      const listEntity = [
        "products.id as productid",
        "suppliers.id as supplierid",
        "suppliers.accountid as accountid",
        "suppliers.name as suppliername",
        "suppliers.email as supplieremai",
        "suppliers.avt as supplieravt",
        "suppliers.isdeleted as supplierisdeleted",
        "suppliers.address as supplieraddress",
      ];
      const prod: any = await Products.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "products.supplierid")
        .where("products.name", 'like', '%' + value + '%')
        .orWhere('suppliers.name', 'like', '%' + value + '%')
        .andWhere("products.status", "<>", "deactivated")

      // console.log(prod);
      return res.status(200).send({
        message: "success",
        data: prod,
      });
    } catch (error) {
      console.log(error)
    }
  };


}

// export const ProductController = new ProductsController();
export default new ProductsController();
