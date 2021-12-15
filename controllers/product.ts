import { Products } from '../models/product';
import console from 'console';

class ProductsController {
    public createNewProduct = async (req: any, res: any, next: any) => {
        try {
            let {
                name = '',
                retailprice,
                wholesaleprice,
                quantity,
                quantityforwholesale,
                description = '',
                image = '',
                // categoriesid='',
                // createdat,
                // updatedat
            } = req.body;

            if (!name || !retailprice || !wholesaleprice || !quantity || !quantityforwholesale || !description) {
                return res.send(400).send('Make sure you filled name, retail price, wholesaleprice, quantity, quantity for wholesale and description');
            }
            if (retailprice < wholesaleprice) {
                return res.send(400).send('Make sure retai lprice < whole sale price');
            }

            if (quantity < quantityforwholesale) {
                return res.status(400).send('quantity is amount of available products for sale. Are you sure quantity < quantity for wholesale? ')
            }

            

        } catch (error) {
            console.log(error);
        }
    }

}