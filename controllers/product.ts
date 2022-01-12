import { Products } from "../models/products";
import console from "console";
import { Suppliers } from "../models/suppliers";

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
        typeofproduct = ""
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
        typeofproduct: typeofproduct
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
        status = false,
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

  public getAllProductAndSupplierInformation = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.query.supplierId;
      let ListSupplierEntity = [
        'suppliers.id as supplierId',
        'suppliers.accountid as accountId',
        'suppliers.name as supplierName',
        'suppliers.email as supplierEmai',
        'suppliers.avt as supplierAvt',
        'suppliers.isdeleted as supplierIsDeleted',
        'suppliers.address as supplierAddress',
        'suppliers.createdat as supplierCreatedAt',
        'suppliers.updatedat as supplierUpdatedAt'
      ]

      // let ListProductEntity=[
      //   'product.id as productId',
      //   'product.name as productName',
      //   'product.supplierid as supplierId',
      //   'product.retailprice as productRetailPrice',
      //   'product.quantity as productQuantity',
      //   'product.description as productDescription',
      //   'product.image as productImage',
      //   'product.categoryid as productCategoryId',
      //   'product.status as productStatus',
      //   'product.typeofproduct as typeOfProduct',
      //   'product.createdat as productCreatedAt',
      //   'product.updatedat as productUpdatedAt',

      // ]
      const List = supplierId
        ? await Products.query()
          .select('products.*', ...ListSupplierEntity)
          // .join('suppliers', 'suppliers.id', 'products.supplierid')
          .join('suppliers', 'suppliers.id', 'products.supplierid')

          .where("supplierid", supplierId)
          .andWhere("status", "active")
        : await Products.query().select(...ListSupplierEntity, 'products.*')
          .join('suppliers', 'suppliers.id', 'products.supplierid')
          .where("status", "active");
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

  //supplier  or inspector can do it
  public deleteProduct = async (req: any, res: any, next: any) => {
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
}

// export const ProductController = new ProductsController();
export default new ProductsController();
