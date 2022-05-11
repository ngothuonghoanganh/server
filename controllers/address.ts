import { Address } from "../models/address";

class AddressController {
    public createAddress = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            let {
                provinceId,
                province,
                districtId,
                district,
                wardId,
                ward,
                street,
                isdefault = 'true'
            } = req.body;

            const currentAddress: any = await Address.query()
                .select()
                .where('customerId', customerId)
            if (currentAddress.length > 0) {
                isdefault = false
            } else {
                isdefault = true;
            }
            // console.log(currentAddress.length)
            const newAddress: any = await Address.query()
                .insert({
                    provinceId,
                    province,
                    districtId,
                    district,
                    wardId,
                    ward,
                    street: street,
                    customerId: customerId,
                    isDefault: isdefault
                })
            return res.status(200).send({
                message: 'successful',
                data: newAddress
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });
        }
    };

    public getAllAdressDefault = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            const listAddress: any = await Address.query()
                .select()
                .where('customerId', customerId)
                .andWhere('isDefault', true)

            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });
        }
    };

    public getAllAdress = async (req: any, res: any, next: any) => {
        try {
            const customerId = req.user.id;
            const listAddress: any = await Address.query()
                .select()
                .where('customerId', customerId)

            // .andWhere('isdefault', true)

            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });
        }
    };

    public updateAdress = async (req: any, res: any, next: any) => {
        try {
            const { addressId } = req.params;
            let {
                provinceId,
                province,
                districtId,
                district,
                wardId,
                ward,
                street,
            } = req.body;
            const listAddress: any = await Address.query()
                .update({
                    provinceId,
                    province,
                    districtId,
                    district,
                    wardId,
                    ward,
                    street: street
                })
                .where('id', addressId)
            return res.status(200).send({
                message: 'successful',
                data: listAddress
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });
        }
    };

    public deleteAdress = async (req: any, res: any, next: any) => {
        try {
            const { addressId } = req.params;

            const isDeleted: any = await Address.query()
                .del()
                .where('id', addressId)
            return res.status(200).send({
                message: 'successful',
                data: isDeleted
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });
        }
    };

    public getAdressByCustomerId = async (req: any, res: any, next: any) => {
        try {
            const { customerId } = req.params;

            const data: any = await Address.query()
                .select()
                .where('customerId', customerId)
            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error);
            return res.status(400).send({ message: error });

        }
    };


}

export default new AddressController();
