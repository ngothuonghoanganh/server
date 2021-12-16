import { Products } from '../models/product';
import console from 'console';

class ProductsController {
    public createNewProduct = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            const { categoryId } = req.params;
            console.log(categoryId)
            let {
                name,
                retailPrice,
                wholesalePrice,
                quantity,
                quantityForWholesale,
                description = "",
                image = "",
                // categoriesid='',
                // createdat,
                // updatedat
            } = req.body;
            console.log(categoryId)
            if (!name || !retailPrice || !wholesalePrice || !quantity || !quantityForWholesale || !description) {
                return res.send(400).send('Make sure you filled name, retail price, wholesaleprice, quantity, quantity for wholesale and description');
            }
            console.log('-------------');

            if (retailPrice < wholesalePrice) {
                return res.send(400).send('Make sure retai lprice < whole sale price');
            }

            if (quantity < quantityForWholesale) {
                return res.status(400).send('quantity is amount of available products for sale. Are you sure quantity < quantity for wholesale? ')
            }
            const prod: any = await Products.query()
                .insert({
                    userid: id,
                    name: name,
                    retailprice: retailPrice,
                    wholesaleprice: wholesalePrice,
                    quantity: quantity,
                    quantityforwholesale: quantityForWholesale,
                    description: description,
                    image: image,
                    categoryid: categoryId
                })


            return res.send({
                status: 200,
                message: 'inserted product: ' + name,
                data: prod
            });

        } catch (error) {
            console.log(error);
        }
    }

    public updateProduct = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            const { productId } = req.params;
            let {
                name,
                retailPrice,
                wholesalePrice,
                quantity,
                quantityforwholesale,
                description = "",
                image = "",
                isDeleted = false

            } = req.body

            if (!retailPrice || !Number.isInteger(retailPrice)) {
                return res.status(400).send('Make sure you enter a number for retail price!');
            }

            if (!wholesalePrice || retailPrice <= wholesalePrice || !Number.isInteger(retailPrice) || !Number.isInteger(wholesalePrice)) {
                return res.status(400).send('Make sure retail price and whole sale Price is a integer number and whole sale price <= retail price');
            }

            const product: any = await Products.query()
                .update({
                    name: name,
                    retailprice: retailPrice,
                    wholesaleprice: wholesalePrice,
                    quantity: quantity,
                    quantityforwholesale: quantityforwholesale,
                    description: description,
                    image: image,
                    isdeleted: isDeleted
                })
                .where('userid', id)
                .andWhere('id', productId)
                .andWhere('isdeleted', false);
            // console.log(product);
            return res.status(200).send({
                message: 'updated product: ' + name,
                data: null
            })
        } catch (error) {
            console.log(error);
        }

    }

    public getAllProductByUserId = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            const List = await Products.query()
                .select('products.*')
                .where('userid', id)
                .andWhere('isdeleted', false);

            return res.status(200).send({
                message: 'loaded product with name ',
                data: List
            });
        } catch (error) {
            console.log(error);
        }
    }

}


export const ProductController = new ProductsController();
