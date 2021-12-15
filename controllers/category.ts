
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

}
export const CateController = new CategoriesController();
