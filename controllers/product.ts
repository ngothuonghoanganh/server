import { Products } from "../models/products";
import console from "console";

class ProductsController {
  public createNewProduct = async (req: any, res: any, next: any) => {
    try {
      // const { id } = req.user;
      const { categoryId = null } = req.body;
      let {
        name,
        retailPrice,
        quantity,
        description = "",
        image = "",
        typeofproduct = "",
        // categoriesid='',
        // createdat,
        // updatedat
      } = req.body;
      console.log(categoryId);
      if (!name || !retailPrice || !quantity || !description) {
        return res
          .status(400)
          .send(
            "Make sure you filled name, retail price, quantity, quantity for wholesale and description"
          );
      }
      console.log("-------------");

      const prod: any = await Products.query().insert({
        supplierid: req.user.id,
        name: name,
        retailprice: retailPrice,
        quantity: quantity,
        description: description,
        image: JSON.stringify(image),
        categoryid: categoryId,
      });
      return res.status(200).send({
        status: 200,
        message: "inserted product: " + name,
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateProduct = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.user;
      const { productId } = req.params;
      let {
        name,
        retailPrice,
        quantity,
        description = "",
        image = "",
        isDeleted = false,
        typeofproduct = "",
      } = req.body;

      //       if (!retailPrice || !Number.isInteger(retailPrice)) {
      //         return res
      //           .status(400)
      //           .send("Make sure you enter a number for retail price!");
      //       }

      await Products.query()
        .update({
          name: name,
          retailprice: retailPrice,
          quantity: quantity,
          description: description,
          image: image,
          typeofproduct: typeofproduct,
        })
        .where("supplierid", id)
        .andWhere("id", productId)
        .andWhere("status", "active");

      const productUpdated: any = await Products.query()
        .select()
        .where("id", productId);
      return res.status(200).send({
        message: "updated product: " + name,
        data: productUpdated,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllProduct = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.query.supplierId;
      const List = supplierId
        ? await Products.query()
            .select("products.*")
            .where("supplierid", supplierId)
            .andWhere("status", "active")
        : await Products.query().select("products.*").where("status", "active");

      return res.status(200).send({
        message: "loaded product with name ",
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
        .where("products.status", "active")
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

  public getProductById = async (req: any, res: any, next: any) => {
    try {
      const { productId } = req.params;
      const prod: any = await Products.query()
        .select()
        .where("id", productId)
        .andWhere("status", "active")
        .first();

      return res.status(200).send({
        message: "success",
        data: prod,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deleteProduct = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.user.id;
      const { productId } = req.params;
      let { isDeleted = true } = req.body;

      await Products.query()
        .update({
          status: "deactivated",
        })
        .where("supplierid", supplierId)
        .andWhere("id", productId)
        .andWhere("status", "active");

      return res.status(200).send({
        message: "Delete Success",
        data: null,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

// export const ProductController = new ProductsController();
export default new ProductsController();
