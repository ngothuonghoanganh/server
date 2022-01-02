import console from "console";
import { Categories } from "../models/category";

class CategoriesController {
  public createNewCate = async (req: any, res: any, next: any) => {
    try {
      const supplierid = req.user.id;

      let { categoryName } = req.body;

      const newCate: any = await Categories.query().insert({
        categoryname: categoryName,
        supplierid: supplierid,
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
    const { id } = req.user;
    try {
      const List = await Categories.query()
        .select("categories.*")
        .where("isdeleted", false)
        .andWhere("supplierid", id);
      return res.status(200).send({
        data: List,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deleteCate = async (req: any, res: any, next: any) => {
    try {
      const { categoryId } = req.params;
      
      console.log(categoryId)
      await Categories.query()
        .update({
          isdeleted: true
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
          categoryname: categoryName,
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

  public getAllCateMobi = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.userId;
      const List = await Categories.query()
        .select("categories.*")
        .where("isdeleted", false)
        .andWhere("userid", userId);
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
      const cate = await Categories.query()
        .select("categories.*")
        .where("isdeleted", false)
        .andWhere("id", categoryId)
        .first();
      return res.status(200).send({
        data: cate,
        message: "got the list categories",
      });
    } catch (error) {
      console.log(error);
    }
  };
}
export default new CategoriesController();
