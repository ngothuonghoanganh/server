import { Cart } from '../models/cart'

class CartController {
    public addToCart = async (req: any, res: any, next: any) => {
        try {
            const { id } = req.user;
            // console.log(id)
            const { productid } = req.params;
            // console.log(productid)

            let {
                quantity,
                createdat,
                updatedat,
                typeofproduct
            } = req.body

            if (!Number.isInteger(quantity)) {
                console.log('quantity must be a integer number');
            }

            const newCart = await Cart.query()
                .insert({
                    productid: productid,
                    quantity: quantity,
                    userid: id,
                    createdat: createdat,
                    updatedat: updatedat,
                    typeofproduct: typeofproduct
                });

            return res.status(200).send({
                message: 'success',
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
                quantity,
                typeofproduct
            } = req.body
            const updateCart = await Cart.query()
                .update({
                    quantity: quantity,
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
            await Cart.query().where('id', cartId).del();
            return res.status(200).send({
                message: 'cart deleted',
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
                .where('userid', id)

            res.status(200).send({
                message: 'success',
                data: List
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const ShoppingCartController = new CartController();
