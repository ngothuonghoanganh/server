import console from "console";
import { CustomerDiscountCode } from "../models/customerdiscountcode";
import { DiscountCode } from "../models/discountcode";
import { Suppliers } from "../models/suppliers";

class CustomerDiscountCodeController {
    public createCustomerDiscountCode = async (req: any, res: any, next: any) => {
        try {
            let {
                discountCodeId,
                status = "ready",
                customerId
            } = req.body;

            let createCode = await CustomerDiscountCode.query()
                .insert({
                    discountCodeId: discountCodeId,
                    // quantity: quantity,
                    status: status,
                    customerId: customerId
                })

            return res.status(200).send({
                message: "successful",
                data: createCode,
            });
        } catch (error) {
            console.log(error)
            return res.status(400).send({ message: error });
        }
    };

    public getListDiscountCodeByStatus = async (req: any, res: any, next: any) => {
        try {
            const status = req.query.status;
            const customerId = req.user.id
            // console.log(status)
            const ListEntity = [
                'customerDiscountCodes.customerId as customerid',
                'customerDiscountCodes.id as id',
                'customerDiscountCodes.discountCodeId as discountcodeid',
                'customerDiscountCodes.status as customerdiscountcodestatus',
            ]

            const discountCodeEntit = [
                'discountCodes.supplierId as supplierid',
                'discountCodes.code as code',
                'discountCodes.description as description',
                'discountCodes.minimumPriceCondition as minimumpricecondition',
                'discountCodes.startDate as startdate',
                'discountCodes.endDate as enddate',
                'discountCodes.quantity as quantity',
                'discountCodes.createdAt as createdat',
                'discountCodes.updatedAt as updatedat',
                'discountCodes.status as status',
                'discountCodes.productId as productid',
                'discountCodes.discountPrice as discountprice',
            ]
            let ListSupplierEntity = [
                "suppliers.id as supplierid",
                "suppliers.accountId as accountid",
                "suppliers.name as suppliername",
                "suppliers.email as supplieremail",
                "suppliers.avt as supplieravt",
                "suppliers.isDeleted as supplierisdeleted",
                "suppliers.address as supplieraddress",
            ];
            // console.log(status)
            const listDiscountCode: any = await CustomerDiscountCode.query()
                .select(...discountCodeEntit, ...ListEntity, ...ListSupplierEntity)
                .join('discountCodes', 'discountCodes.id', 'customerDiscountCodes.discountCodeId')
                .join('suppliers', 'suppliers.id', 'discountCodes.supplierId')
                .where('customerDiscountCodes.status', status)
                .andWhere('customerId', customerId)
            // const supplierData=await Suppliers.query().select().where('id', listDiscountCode)
            return res.status(200).send({
                message: 'successful',
                data: listDiscountCode
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({ message: error });
        }
    };

    public reduceDiscountUse = async (req: any, res: any, next: any) => {
        try {
            const status = 'used';
            const customerDiscountCodeId = req.body.customerDiscountCodeId;

            const updateStatusForCusDiscountCode: any = await CustomerDiscountCode.query()
                .update({
                    status: status
                })
                .where('id', customerDiscountCodeId)
                .andWhere('status', 'ready')

            if (updateStatusForCusDiscountCode === 0) {
                return res.status(200).send('discount code is used')
            }

            const currentDiscountCodeId: any = await CustomerDiscountCode.query()
                .select('discountCodeId')
                .where('id', customerDiscountCodeId)
                .first()

            // console.log(currentDiscountCodeId['discountcodeid'])

            // const currentQuantityOfDiscountCode: any = await DiscountCode.query()
            //     .select('quantity')
            //     .where('id', currentDiscountCodeId['discountcodeid'])
            //     .first()
            // console.log(currentQuantityOfDiscountCode['quantity']);
            // const updateQuantity: any = await DiscountCode.query()
            //     .update({
            //         quantity: currentQuantityOfDiscountCode['quantity'] - 1
            //     })
            //     .where('id', currentDiscountCodeId['discountcodeid'])
            // console.log(updateQuantity)


            return res.status(200).send({
                message: 'successful',
                data: currentDiscountCodeId
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({ message: error });
        }
    };

    public getListCustomerDiscountCodeBySuppId = async (req: any, res: any, next: any) => {
        try {
            const suppId = req.body.suppId;
            const customerId = req.user.id;
            const status = 'ready';
            const minPriceCondition = req.body.minPriceCondition;
            const productIds = req.body.productIds;
            // console.log(productIds)
            const ListEntity = [
                'customerDiscountCodes.id as id',
                'customerDiscountCodes.customerId as customerid',
                'customerDiscountCodes.discountCodeId as discountcodeid',
                'customerDiscountCodes.status as customerdiscountcodestatus',
            ]

            const discountCodeEntity = [
                'discountCodes.supplierId as supplierid',
                'discountCodes.code as code',
                'discountCodes.description as description',
                'discountCodes.minimumPriceCondition as minimumpricecondition',
                'discountCodes.startDate as startdate',
                'discountCodes.endDate as enddate',
                'discountCodes.quantity as quantity',
                'discountCodes.createdAt as createdat',
                'discountCodes.updatedAt as updatedat',
                'discountCodes.status as status',
                'discountCodes.productId as productid',
                'discountCodes.discountPrice as discountprice',
            ]

            const ListCusDiscountCode = productIds
                ? await CustomerDiscountCode.query()
                    // .select('discountcode.*', ...ListEntity)
                    // .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    // .where('discountcode.supplierid', suppId)
                    // .andWhere('discountcode.minimumpricecondition', '<=',  minPriceCondition)
                    // .andWhere('customerdiscountcode.status', status)

                    .select(discountCodeEntity, ...ListEntity)
                    .join('discountCodes', 'discountCodes.id', 'customerDiscountCodes.discountCodeId')
                    .whereIn('discountCodes.productId', productIds)
                    .where('discountCodes.supplierId', suppId)
                    .andWhere('customerDiscountCodes.status', status)
                    .andWhere('customerId', customerId)

                : await CustomerDiscountCode.query()
                    // .select('discountcode.*', ...ListEntity)
                    // .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    // .whereIn('discountcode.productid', productIds)
                    // .where('discountcode.supplierid', suppId)
                    // .andWhere('customerdiscountcode.status', status)

                    .select(discountCodeEntity, ...ListEntity)
                    .join('discountCodes', 'discountCodes.id', 'customerDiscountCodes.discountCodeId')
                    .where('discountCodes.supplierId', suppId)
                    .andWhere('discountCodes.minimumPriceCondition', '<=', minPriceCondition)
                    .andWhere('customerDiscountCodes.status', status)
                    .andWhere('customerId', customerId)

            console.log(ListCusDiscountCode)
            return res.status(200).send({
                message: 'successful',
                data: ListCusDiscountCode
            })
        } catch (error) {
            return res.status(400).send({ message: error });
            console.log(error)
        }
    };

    public getCustomerDiscountByDiscountCodeAndSuppId = async (req: any, res: any, next: any) => {
        try {
            const status = 'ready';
            const discountCode = req.body.discountCode;
            const supplierId = req.body.supplierId;
            const customerId = req.user.id;
            const ListEntity = [
                'customerDiscountCodes.id as id',
                'customerDiscountCodes.customerId as customerid',
                'customerDiscountCodes.discountCodeId as discountcodeid',
                'customerDiscountCodes.status as customerdiscountcodestatus',
            ]

            const discountCodeEntity = [
                'discountCodes.supplierId as supplierid',
                'discountCodes.code as code',
                'discountCodes.description as description',
                'discountCodes.minimumPriceCondition as minimumpricecondition',
                'discountCodes.startDate as startdate',
                'discountCodes.endDate as enddate',
                'discountCodes.quantity as quantity',
                'discountCodes.createdAt as createdat',
                'discountCodes.updatedAt as updatedat',
                'discountCodes.status as status',
                'discountCodes.productId as productid',
                'discountCodes.discountPrice as discountprice',
            ]
            let ListSupplierEntity = [
                "suppliers.id as supplierid",
                "suppliers.accountId as accountid",
                "suppliers.name as suppliername",
                "suppliers.email as supplieremail",
                "suppliers.avt as supplieravt",
                "suppliers.isDeleted as supplierisdeleted",
                "suppliers.address as supplieraddress",
            ];

            const data = await CustomerDiscountCode.query()
                .select(...ListEntity, ...discountCodeEntity, ...ListSupplierEntity)
                .join('discountCodes', 'discountCodes.id', 'customerDiscountCodes.discountCodeId')
                .join('suppliers', 'suppliers.id', 'discountCodes.supplierId')
                .where('customerDiscountCodes.status', status)
                .andWhere('discountCodes.code', discountCode)
                .andWhere('discountCodes.supplierId', supplierId)
                .andWhere('customerDiscountCodes.customerId', customerId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
            return res.status(400).send({ message: error });
        }
    };
}

export default new CustomerDiscountCodeController();
