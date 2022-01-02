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
        .andWhere("userid", id);
      return res.status(200).send({
        data: List,
        message: "got the list categories",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateCate = async (req: any, res: any, next: any) => {
    try {
      const { categoryId } = req.params;
      let { categoryName} = req.body;

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
