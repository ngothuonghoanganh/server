import { Categories } from "../models/category";
import { Products } from "../models/products";
import dbEntity from "../services/dbEntity";
import Entity from "../services/dbEntity";

class CategoriesController {
  public createNewCate = async (req: any, res: any, next: any) => {
    try {
      const supplierid = req.user.id;

      let { categoryName } = req.body;

      const newCate: any = await Categories.query().insert({
        categoryName: categoryName,
        supplierId: supplierid,
      });

      return res.status(200).send({
        message: "create success",
        data: newCate,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllCate = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.user;
      const List: any = await Categories.query()
        .select(...Entity.categoryEntity)
        .where("isDeleted", false)
        .andWhere("supplierId", id);


      for (const item of List) {
        const numOfProduct: any = await Products.query().select().count().where('categoryId', item.id).first();
        item.numOfProduct = numOfProduct.count;
      }
      return res.status(200).send({
        data: List,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getAllCateByQuery = async (req: any, res: any, next: any) => {
    try {
      const { supplierId } = req.query;
      // console.log(userId)
      const List: any = await Categories.query()
        .select(...dbEntity.categoryEntity)
        // .where('isDeleted', false)
        .join('products', 'products.categoryId', 'categories.id')
        .where('categories.supplierId', supplierId)

      // console.log(List)
      for (const item of List) {
        const numOfProduct: any = await Products.query().select().count().where('categoryId', item.id).first();
        item.numOfProduct = numOfProduct.count;
      }

      return res.status(200).send({
        message: 'successful',
        data: List
      })
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  }

  public deleteCate = async (req: any, res: any, next: any) => {
    try {
      const { categoryId } = req.params;
      const isExistProds = await Products.query().select().where('categoryId', categoryId);
      if (isExistProds.length === 0) {
        await Categories.query()
          .update({
            isDeleted: true
          })
          .where('id', categoryId)
        return res.status(200).send({
          message: 'deactivated a cate',
        })
      } else {
        return res.status(200).send('Please delete all products belong to this catalog before deleting the catalog!')
      }

    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  }

  public updateCate = async (req: any, res: any, next: any) => {
    try {
      const { categoryId } = req.params;
      let { categoryName } = req.body;

      await Categories.query()
        .update({
          categoryName: categoryName,
        })
        .where("id", categoryId)
        .andWhere("isDeleted", false);
      const cateUpdated: any = await Categories.query().where("id", categoryId);
      return res.status(200).send({
        data: cateUpdated,
        message: "update successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  //do not use
  public getAllCateMobi = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.userId;
      const List = await Categories.query()
        .select(...dbEntity.categoryEntity)
        .where("isDeleted", false)
        .andWhere("userId", userId);
      return res.status(200).send({
        data: List,
        message: "got the list categories",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getOne = async (req: any, res: any, next: any) => {
    try {
      const categoryId = req.params.categoryId;
      const cate: any = await Categories.query()
        .select(...dbEntity.categoryEntity)
        .where("isDeleted", false)
        .andWhere("id", categoryId)
        .first();
      return res.status(200).send({
        data: cate,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}
export default new CategoriesController();
