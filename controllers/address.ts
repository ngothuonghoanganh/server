import { Address } from "../models/address";

class AddressController {
    public createAddress = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            let {
                province,
                street,
                isdefault = 'true'
            } = req.body;

            const currentAddress: any = await Address.query()
                .select()
                .where('customerid', customerId)
            if (currentAddress.length > 0) {
                isdefault = false
            } else {
                isdefault = true;
            }
            // console.log(currentAddress.length)
            const newAddress: any = await Address.query()
                .insert({
                    customerid: customerId,
                    province: province,
                    street: street,
                    isdefault: isdefault
                })
            return res.status(200).send({
                message: 'successful',
                data: newAddress
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getAllAdressDefault = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            const listAddress: any = await Address.query()
                .select()
                .where('customerid', customerId)
                .andWhere('isdefault', true)

            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error)
        }
    };

    public getAllAdress = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            const listAddress: any = await Address.query()
                .select()
            // .where('customerid', customerId)
            // .andWhere('isdefault', true)

            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error)
        }
    };

    public updateAdress = async (req: any, res: any, next: any) => {
        try {
            const {addressId} = req.params;
            let {
                province,
                street,
            } = req.body;
            const listAddress: any = await Address.query()
                .update({
                    province: province,
                    street: street
                })
                .where('id', addressId)
            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error)
        }
    };

    public deleteAdress = async (req: any, res: any, next: any) => {
        try {
            const {addressId} = req.params;

            const isDeleted: any = await Address.query()
                .del()
                .where('id', addressId)
            return res.status(200).send({
                message: 'successful',
                data: isDeleted
            })
        } catch (error) {
            console.log(error)

        }
    };


}

export default new AddressController();