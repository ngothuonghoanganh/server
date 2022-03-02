import { Comments } from "../models/comment";
import { OrderDetail } from "../models/orderdetail";
import { Order } from "../models/orders";

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
            const productId = req.params.productId;
            // console.log(productId)
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
            let totalNumOfComment = 0;
            let averageRating
            const data: any = await Comments.query()
                .select(
                    '*'
                )
                .where('productid', productId)

            if (data.length > 0) {
                totalNumOfComment = data.length
                averageRating = (data.map((item: any) => item.rating).reduce((prev: any, next: any) => prev + next)) / totalNumOfComment;
                return res.status(200).send({
                    message: 'successful',
                    data: ({ comments: data, totalNumOfComment, averageRating })
                })
            }

            return res.status(200).send({
                message: 'successful',
                data: ({ comment: 'no comment', rating: 'no rating'})
            })
        } catch (error) {
            console.log(error)
        }
    };

    public countNumOfOrderCompleted = async (req: any, res: any, next: any) => {
        try {
            const productIds = req.body.productIds;
            const status = "completed";
            const ListEntity = [
                'orderdetail.id as orderDetailId',
                'orders.status as orderStatus',
                'orderdetail.productid as productId'
            ]
            const numOfOrderCompletedByProductId = await OrderDetail.query()
                .select(
                    ...ListEntity,
                )
                .join('orders', 'orderdetail.orderid', 'orders.id')
                .whereIn('orderdetail.productid', productIds)
                .andWhere('orders.status', status)
                .groupBy('orderdetail.id')
                .groupBy('orders.id')

            // console.log(numOfOrderCompletedByProductId)
            // const counts = numOfOrderCompletedByProductId.reduce((c, { productId : key }) => (c[key] = (c[key] || 0) + 1, c), {});
            const result = numOfOrderCompletedByProductId.reduce((r, a: any) => {
                r[a.productId] = r[a.productId] || [];
                r[a.productId].push(a);
                return r;
            }, Object.create({}));
            console.log(result)
            // Object.keys(result.Data).length
            // const countUniques = (result = []) => {
            //     const tableObj = {} = {};
            //     result.forEach(el => {
            //         tableObj[el.productId] = null;
            //     //    foodObj[result.food_id] = null;
            //     });
            //     const tableUniqueIDs = Object.keys(tableObj).length;
            //     // const foodUniqueIDs = Object.keys(foodObj).length;
            //     return {
            //        tableUniqueIDs
            //     };
            //  };

            // let counts = [];
            // for (var i = 0; i < result.length; i++) {
            //     counts[result[i]] = 1 + (counts[result[i]] || 0);
            // }
            // console.log(result)
            // const counts: any = {};
            // result.forin((x: any) => {
            //     counts[x] = (counts[x] || 0) + 1;
            // });

            // const counts: any = {};
            // result.forin((x: any) => {
            //     counts[x] = (counts[x] || 0) + 1;
            // });
            // console.log(counts)

            // const counts: any = {};
            // result.forEach((x: any) => {
            //     counts[x] = (counts[x] || 0) + 1;
            // });
            // console.log(counts)

            return res.status(200).send({
                message: 'successful',
                data: ({ result, })
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default new Comment();


