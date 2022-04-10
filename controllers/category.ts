import console from "console";
import { Categories } from "../models/category";

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
    }
  };

  public getAllCate = async (req: any, res: any, next: any) => {
    try {
      const  {id}  = req.user;
      const List = await Categories.query()
        .select("categories.*")
        .where("isDeleted", false)
        .andWhere("supplierId", id);
      return res.status(200).send({
        data: List,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCateByQuery = async (req: any, res: any, next: any) => {
    try {
      const { userId } = req.query;
      // console.log(userId)
      const List = await Categories.query()
        .select('categories.*')
        .where('isdeleted', false)
        .andWhere('supplierId', userId)

      // console.log(List)

      return res.status(200).send({
        message: 'successful',
        data: List
      })
    } catch (error) {
      console.log(error)
    }
  }

  public deleteCate = async (req: any, res: any, next: any) => {
    try {
      const { categoryId } = req.params;
      await Categories.query()
        .update({
          isDeleted: true
        })
        .where('id', categoryId)

      res.status(200).send({
        message: 'deactivated a cate',

      })
    } catch (error) {
      console.log(error)
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
        .andWhere("isdeleted", false);
      const cateUpdated: any = await Categories.query().where("id", categoryId);
      return res.status(200).send({
        data: cateUpdated,
        message: "update successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  //do not use
  public getAllCateMobi = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.userId;
      const List = await Categories.query()
        .select("categories.*")
        .where("isDeleted", false)
        .andWhere("userId", userId);
      return res.status(200).send({
        data: List,
        message: "got the list categories",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOne = async (req: any, res: any, next: any) => {
    try {
      const categoryId = req.params.categoryId;
      const cate: any = await Categories.query()
        .select("categories.*")
        .where("isDeleted", false)
        .andWhere("id", categoryId)
        .first();
      return res.status(200).send({
        data: cate,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };
}
export default new CategoriesController();
