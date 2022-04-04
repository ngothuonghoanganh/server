import { Products } from "../models/products";
import console from "console";
import { Suppliers } from "../models/suppliers";
import { Comments } from "../models/comment";
import { rmSync } from "fs";
import { any } from "joi";
import { Categories } from "../models/category";

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
        categoryId,
        status = "active",
      } = req.body;

      const prod: any = await Products.query().insert({
        name: name,
        retailprice: retailPrice,
        quantity: quantity,
        description: description,
        image: JSON.stringify(image),
        categoryid: categoryId,
        status: status,
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
      const { productId } = req.params;
      let {
        name,
        retailPrice,
        quantity,
        description,
        image,
        categoryId,
      } = req.body;

      const productUpdated: any = await Products.query()
        .update({
          name: name,
          retailprice: retailPrice,
          categoryid: categoryId,
          quantity: quantity,
          description: description,
          image: JSON.stringify(image),
        })
        .where("id", productId)
        .andWhere("status", "<>", "incampaign");

      if (productUpdated === 0) {
        return res.status(200).send({
          message: 'update failed',
          data: 0
        })
      }
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

      // const List = supplierId
      //   ? await Products.query()
      //     .select("products.*", ...ListSupplierEntity)
      //     // .join('suppliers', 'suppliers.id', 'products.supplierid')
      //     .join("suppliers", "suppliers.id", "products.supplierid")
      //     .where("supplierid", supplierId)
      //     .andWhere("status", "<>", "deactivated")
      //   : await Products.query()
      //     .select(...ListSupplierEntity, "products.*")
      //     .join("suppliers", "suppliers.id", "products.supplierid")
      //     .where("status", "<>", "deactivated");

      const List = supplierId ? await Categories.query()
        .select("products.*", ...ListSupplierEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join('products', 'products.categoryid', 'categories.id')
        .where('products.status', '<>', 'deactivated')
        .andWhere('categories.supplierid', supplierId)
        :
        await Categories.query()
          .select("products.*", ...ListSupplierEntity)
          .join("suppliers", "suppliers.id", "categories.supplierid")
          .join('products', 'products.categoryid', 'categories.id')
          .where('products.status', '<>', 'deactivated')

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
        .select(...listEntity, 'campaigns.maxquantity')
        .join('campaigns', 'campaigns.productid', 'products.id')
        .leftOuterJoin("categories", "categories.id", "products.categoryid")
        .where("products.status", "<>", "deactivated")
        .andWhere("categories.supplierid", req.user.id);

      return res.status(200).send({
        message: "get success",
        data: prods,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // public getAllProductsBySupplierId = async (req: any, res: any, next: any) => {
  //   try {
  //     let listEntity = [
  //       "products.*",
  //       // "categories.categoryname as categoryname",
  //       // "categories.id as categoryid",
  //     ];
  //     const supplierId = req.query.supplierId;

  //     let prods = await Products.query()
  //       .select(...listEntity)
  //       // .leftOuterJoin("categories", "categories.id", "products.categoryid")
  //       // .where("products.status", "<>", "deactivated")
  //       .where("products.supplierid", supplierId);

  //     prods = prods.map((prod: any) => {
  //       if (prod.image) {
  //         console.log(prod.image);
  //         // prod.image = JSON.parse(prod.image);
  //       }
  //       return prod;
  //     });
  //     // console.log('test')
  //     return res.status(200).send({
  //       message: "get success",
  //       data: prods,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  public getProductById = async (req: any, res: any, next: any) => {
    try {
      // console.log('testtt')
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
      const data = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join('products', 'products.categoryid', 'categories.id')
        .where('products.id', productId)
        .first()

      console.log(data);
      return res.status(200).send({
        message: "success",
        data: data,
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
      const prod: any = await Categories.query()
        .select("products.*", ...listEntity)
        .join("suppliers", "suppliers.id", "categories.supplierid")
        .join('products', 'products.categoryid', 'categories.id')
        .where("products.name", 'like', '%' + value + '%')
        .orWhere('suppliers.name', 'like', '%' + value + '%')
        .andWhere("products.status", "<>", "deactivated")

      // await Categories.query()
      //   .select("products.*", ...listEntity)
      //   .join("suppliers", "suppliers.id", "categories.supplierid")
      //   .join('products', 'products.categoryid', 'categories.id')
      //   .where("products.name", 'like', '%' + value + '%')
      //   .orWhere('suppliers.name', 'like', '%' + value + '%')
      //   .andWhere("products.status", "<>", "deactivated")


      // console.log(prod);
      return res.status(200).send({
        message: "success",
        data: prod,
      });
    } catch (error) {
      console.log(error)
    }
  };

  public getListProductByCates = async (req: any, res: any, next: any) => {
    try {
      const listCategories = req.body.listCategories;
      // console.log(listCategories)
      const data: any = await Products.query()
        .select()
        .whereIn('categoryid', listCategories)
        // .andWhere('status', 'active')
        // .andWhere('status', 'incampaign')
        .andWhere('status', '<>', 'deactivated');
      // console.log('test')
      // console.log(data)
      // if (data === '' || data === null) {
      //   return res.status(200).send('no product found')
      // }
      return res.status(200).send({
        message: 'successful',
        data: data
      })
    } catch (error) {
      console.log(error)
    }
  };


}

export default new ProductsController();
