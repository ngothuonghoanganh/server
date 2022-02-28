import { Comments } from "../models/comment";

class Comment {
    public CreateNewComment = async (req: any, res: any, next: any) => {
        try {
            let {
                orderDetailId,
                productId,
                comment,
                customerId,
                rating

            } = req.body
            console.log(orderDetailId)

            const createNew = await Comments.query()
                .insert({
                    oderdetailid: orderDetailId,
                    productid: productId,
                    comment: comment,
                    customerid: customerId,
                    rating: rating
                })

            return res.status(200).send({
                message: 'successful',
                data: createNew
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getCommentById = async (req: any, res: any, next: any) => {
        try {
            const commentId = req.params.commentId;
            const ListEntity = [
                'customers.avt',
                'customers.firstname',
                'customers.lastname'
            ]
            const data = await Comments.query()
                .select('comments.*', ...ListEntity)
                .join('customers', 'customers.id', 'comments.customerid')
                .where('comments.id', commentId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getCommentByOrderDetailId = async (req: any, res: any, next: any) => {
        try {
            const orderDetailId = req.query.orderDetailId;
            const ListEntity = [
                'customers.avt',
                'customers.firstname',
                'customers.lastname'
            ]
            const data = await Comments.query()
                .select('comments.*', ...ListEntity)
                .join('customers', 'customers.id', 'comments.customerid')
                .where('oderdetailid', orderDetailId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getCommentByProductId = async (req: any, res: any, next: any) => {
        try {
            const productId = req.body.productId;
            const ListEntity = [
                'customers.avt',
                'customers.firstname',
                'customers.lastname'
            ]
            const data = await Comments.query()
                .select('comments.*', ...ListEntity)
                .join('customers', 'customers.id', 'comments.customerid')
                .where('comments.productid', productId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };

    public countNumOfCommentByProductId = async (req: any, res: any, next: any) => {
        try {
            const productId = req.body.productId;
            const data = await Comments.query()
                .select(
                    // 'comments.id as commentId',
                    Comments.raw(`count(productid) as numOfComment`)
                )
                .where('productid', productId)
                .groupBy('comments.id')
            
               const totalNumOfComment= Object.keys(data).length
            return res.status(200).send({
                message: 'successful',
                data: ({totalNumOfComment})
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default new Comment();


