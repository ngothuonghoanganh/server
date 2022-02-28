import { Comments } from "../models/comment";

class Comment{
    public CreateNewComment = async(req: any, res: any, next: any)=>{
        try{
            let {
                orderId,
                productId,
                comment,
                customerId,
                rating
                
            }=req.body

            const createNew= await Comments.query()
                .insert({
                    orderid: orderId,
                    productid: productId,
                    comment: comment,
                    customerid: customerId,
                    rating: rating
                })

            return res.status(200).send({
                message: 'successful',
                data: createNew
            })
        }catch(error){
            console.log(error)
        }
    };

    public getCommentById = async(req: any, res: any, next: any)=>{
        try{
            const commentId = req.params.commentId;
            const ListEntity =[
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
        }catch(error){
            console.log(error)
        }
    };

    public getCommentByOrderId = async(req: any, res: any, next: any)=>{
        try{
            const orderId = req.query.orderId;
            const ListEntity =[
                'customers.avt',
                'customers.firstname',
                'customers.lastname'
            ]
            const data = await Comments.query()
            .select('comments.*', ...ListEntity)
            .join('customers', 'customers.id', 'comments.customerid')
            .where('orderid', orderId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        }catch(error){
            console.log(error)
        }
    };
}

export default new Comment();


