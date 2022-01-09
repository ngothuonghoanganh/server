import { Cart } from '../models/cart'

class CartController {
    public addToCart = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id; //customer id

            let {
                productId,
                quantity,
                wholesale,
                typeofproduct
            } = req.body

            const newCart: any = await Cart.query()
                .insert({
                    customerid: customerId,
                    productid: productId,
                    quantity: quantity,
                    wholesale: wholesale,
                    typeofproduct: typeofproduct,

                });

            return res.status(200).send({
                message: 'successful',
                data: newCart
            })
        } catch (error) {
            console.log(error);
        }
    }

    public updateCart = async (req: any, res: any, next: any) => {
        try {
            const { cartId } = req.params;
            let {

                productId,
                quantity,
                wholesale,
                typeofproduct,
            } = req.body
            const updateCart = await Cart.query()
                .update({
                    productid: productId,
                    quantity: quantity,
                    wholesale: wholesale,
                    typeofproduct: typeofproduct
                })
                .where('id', cartId);
            return res.status(200).send({
                message: 'cart updated',
                data: updateCart
            })
        } catch (error) {
            console.log(error)
        }
    }

    public deleteCart = async (req: any, res: any, next: any) => {
        try {
            const { cartId } = req.params;
            // console.log(cartId)
            const deleteCart: any = await Cart.query().where('id', cartId).del();
            return res.status(200).send({
                message: 'cart deleted',
                data: deleteCart
            });
        } catch (error) {
            console.log(error)
        }
    }

    public getCartByUserId = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            // console.log(id)
            const List = await Cart.query()
                .select()
                .where('customerid', id)

            res.status(200).send({
                message: 'success',
                data: List
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default new CartController();

