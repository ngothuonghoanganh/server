import console from "console";
import { CustomerDiscountCode } from "../models/customerdiscountcode";
import { DiscountCode } from "../models/discountcode";
import { Suppliers } from "../models/suppliers";

class CustomerDiscountCodeController {
    public createCustomerDiscountCode = async (req: any, res: any, next: any) => {
        try {
            let {
                discountCodeId,
                quantity,
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
        }
    };

    public getListDiscountCodeByStatus = async (req: any, res: any, next: any) => {
        try {
            const status = req.query.status;
            const customerId = req.user.id
            // console.log(status)
            const ListEntity = [
                'customerdiscountcode.customerid as customerId',
                'customerdiscountcode.id as id',
                'customerdiscountcode.discountcodeid as discountCodeId',
                'customerdiscountcode.status as customerDiscountCodeStatus',
            ]

            const discountCodeEntit = [
                'discountcode.supplierid as supplierId',
                'discountcode.code as code',
                'discountcode.description as description',
                'discountcode.minimunpricecondition as minimunPriceCondition',
                'discountcode.startdate as startdate',
                'discountcode.enddate as enddate',
                'discountcode.quantity as quantity',
                'discountcode.createdat as createdAt',
                'discountcode.updatedat as updatedAt',
                'discountcode.status as status',
                'discountcode.productid as productId',
                'discountcode.discountprice as discountPrice',
            ]
            let ListSupplierEntity = [
                "suppliers.id as supplierid",
                "suppliers.accountid as accountid",
                "suppliers.name as suppliername",
                "suppliers.email as supplieremai",
                "suppliers.avt as supplieravt",
                "suppliers.isdeleted as supplierisdeleted",
                "suppliers.address as supplieraddress",
            ];
            // console.log(status)
            const listDiscountCode: any = await CustomerDiscountCode.query()
                .select(...discountCodeEntit, ...ListEntity, ...ListSupplierEntity)
                .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                .join('suppliers', 'suppliers.id', 'discountcode.supplierid')
                .where('customerdiscountcode.status', status)
                .andWhere('customerid', customerId)
            // const supplierData=await Suppliers.query().select().where('id', listDiscountCode)
            return res.status(200).send({
                message: 'successful',
                data: listDiscountCode
            })
        } catch (error) {
            console.log(error)
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
                .select('discountcodeid')
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
                'customerdiscountcode.id as id',
                'customerdiscountcode.customerid as customerId',
                'customerdiscountcode.discountcodeid as discountCodeId',
                'customerdiscountcode.status as customerDiscountCodeStatus',
            ]

            const discountCodeEntity = [
                'discountcode.supplierid as supplierId',
                'discountcode.code as code',
                'discountcode.description as description',
                'discountcode.minimunpricecondition as minimunPriceCondition',
                'discountcode.startdate as startdate',
                'discountcode.enddate as enddate',
                'discountcode.quantity as quantity',
                'discountcode.createdat as createdAt',
                'discountcode.updatedat as updatedAt',
                'discountcode.status as status',
                'discountcode.productid as productId',
                'discountcode.discountprice as discountPrice',
            ]

            const ListCusDiscountCode = productIds
                ? await CustomerDiscountCode.query()
                    // .select('discountcode.*', ...ListEntity)
                    // .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    // .where('discountcode.supplierid', suppId)
                    // .andWhere('discountcode.minimunpricecondition', '<=',  minPriceCondition)
                    // .andWhere('customerdiscountcode.status', status)

                    .select(discountCodeEntity, ...ListEntity)
                    .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    .whereIn('discountcode.productid', productIds)
                    .where('discountcode.supplierid', suppId)
                    .andWhere('customerdiscountcode.status', status)
                    .andWhere('customerid', customerId)

                : await CustomerDiscountCode.query()
                    // .select('discountcode.*', ...ListEntity)
                    // .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    // .whereIn('discountcode.productid', productIds)
                    // .where('discountcode.supplierid', suppId)
                    // .andWhere('customerdiscountcode.status', status)

                    .select(discountCodeEntity, ...ListEntity)
                    .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                    .where('discountcode.supplierid', suppId)
                    .andWhere('discountcode.minimunpricecondition', '<=', minPriceCondition)
                    .andWhere('customerdiscountcode.status', status)
                    .andWhere('customerid', customerId)

            console.log(ListCusDiscountCode)
            return res.status(200).send({
                message: 'successful',
                data: ListCusDiscountCode
            })
        } catch (error) {
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
                'customerdiscountcode.id as id',
                'customerdiscountcode.customerid as customerId',
                'customerdiscountcode.discountcodeid as discountCodeId',
                'customerdiscountcode.status as customerDiscountCodeStatus',
            ]

            const discountCodeEntity = [
                'discountcode.supplierid as supplierId',
                'discountcode.code as code',
                'discountcode.description as description',
                'discountcode.minimunpricecondition as minimunPriceCondition',
                'discountcode.startdate as startdate',
                'discountcode.enddate as enddate',
                'discountcode.quantity as quantity',
                'discountcode.createdat as createdAt',
                'discountcode.updatedat as updatedAt',
                'discountcode.status as status',
                'discountcode.productid as productId',
                'discountcode.discountprice as discountPrice',
            ]
            let ListSupplierEntity = [
                "suppliers.id as supplierid",
                "suppliers.accountid as accountid",
                "suppliers.name as suppliername",
                "suppliers.email as supplieremai",
                "suppliers.avt as supplieravt",
                "suppliers.isdeleted as supplierisdeleted",
                "suppliers.address as supplieraddress",
            ];

            const data = await CustomerDiscountCode.query()
                .select(...ListEntity, ...discountCodeEntity, ...ListSupplierEntity)
                .join('discountcode', 'discountcode.id', 'customerdiscountcode.discountcodeid')
                .join('suppliers', 'suppliers.id', 'discountcode.supplierid')
                .where('customerdiscountcode.status', status)
                .andWhere('discountcode.code', discountCode)
                .andWhere('discountcode.supplierid', supplierId)
                .andWhere('customerdiscountcode.customerid', customerId)

            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };
}

export default new CustomerDiscountCodeController();
