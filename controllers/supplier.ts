import { Suppliers } from "../models/suppliers";


class Supplier {

    public updateWalletAccount = async (req: any, res: any, next: any) => {
        try {
            const identificationCard = req.body.identificationcard;
            const identificationImage = req.body.identificationimage;
            const eWalletCode = req.body.ewalletcode;
            const eWalletSecrect = req.body.ewalletsecret;
            const supplierId=req.user.id;

            const data = await Suppliers.query().update({
                identificationcard: identificationCard,
                identificationimage: JSON.stringify(identificationImage),
                ewalletcode: eWalletCode,
                ewalletsecrect: eWalletSecrect
            })
            .where('id', supplierId)
            return res.status(200).send({
                message: 'successful',
                data: data
            })
        } catch (error) {
            console.log(error)
        }
    };
}

export default new Supplier();
