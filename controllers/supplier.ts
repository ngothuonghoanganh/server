import { Suppliers } from "../models/suppliers";
import { Customers } from "../models/customers";


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

    public checkExistedEmail = async(req: any, res: any, next: any)=>{
        console.log('email')
        try {
          const email = req.query.email;
          console.log(email)
          const suppEmail =await Suppliers.query().select().where('email', email);
          const cusEmail =await Customers.query().select().where('email', email);
         console.log(suppEmail.toString()) 
          return res.status(200).send({
            message: 'successful',
            data: ({suppEmai: suppEmail, cusEmail: cusEmail})
          })
        } catch (error) {
          console.log(error)
        }
      };
}

export default new Supplier();
