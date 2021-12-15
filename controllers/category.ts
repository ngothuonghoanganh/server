
import console from "console";
import { Categories } from "../models/category";

class CategoriesController {
    public createNewCate = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;

            let {
                categoryname
            } = req.body;

            if (!categoryname) {
                return res.status(400).send('category name is required');
            }

            await Categories.query().insert({
                categoryname: categoryname,
                userid: id
            });

            return res.status(200).send('category ' + categoryname + ' is created');
        } catch (error) {
            console.log(error);
        }
    }

    public getAllCate = async (req: any, res: any, next: any) => {
        const {id} = req.user;
        try {
            const List = await Categories.query()
                .select('categories.*')
                .where('isdeleted', false)
                .andWhere('userid', id);
            res.send(List);
        } catch (error) {
            console.log(error);
        }
    }

    public updateCate = async (req: any, res: any, next: any) => {
        try {
            const { categoryId } = req.params;
            // const { id } = req.user;
            
            // console.log(req.user);
            const {phone} = req.user;
            console.log(phone)
            let {
                categoryName,
                isDeleted = false
            } = req.body;

            await Categories.query()
                .update({
                    categoryname: categoryName,
                    isdeleted: isDeleted,
                })
                .where("id", categoryId)
                .andWhere("isdeleted", false);
            return res.send('Category updated');
        } catch (error) {
            console.log(error);
        }
    }

}
export const CateController = new CategoriesController();
