import { LoyalCustomer } from "../models/loyalCustomer";
import { LoyalCustomerCondition } from "../models/loyalCustomerCondition";
import { Suppliers } from "../models/suppliers";
import dbEntity from "../services/dbEntity";

class LoyalcustomerController {
  public create = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent, name } = req.body;
      const supplierId = req.user.id;

      const newConditon = await LoyalCustomerCondition.query().insert({
        supplierId: supplierId,
        minOrder: minOrder,
        minProduct: minProduct,
        discountPercent: discountPercent,
        name: name
      });

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public update = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent, name } = req.body;
      const id = req.params.loyalCustomerConditionId;

      const newConditon = await LoyalCustomerCondition.query()
        .update({
          minOrder: minOrder,
          minProduct: minProduct,
          discountPercent: discountPercent,
          name: name,
        })
        .where("id", id);

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public delete = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerConditionId;

      const newConditon = await LoyalCustomerCondition.query()
        .delete()
        .where("id", id);

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public getOne = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerConditionId;

      const condition = await LoyalCustomerCondition.query()
        .select()
        .where("id", id)
        .first();

      return res.status(200).send({
        data: condition,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public getAll = async (req: any, res: any, next: any) => {
    try {
      const data = await LoyalCustomerCondition.query().select(...dbEntity.loyaCustomerConditionEntity);
      console.log(data)
      return res.status(200).send({
        data: data,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public getAllCustomer = async (req: any, res: any, next: any) => {
    try {
      const listEntity = [
        "customers.id as customerid",
        "customers.firstName as customerfirstname",
        "customers.lastName as customerlastname",
        "customers.avt as customeravt",
      ];
      const data = await LoyalCustomer.query()
        .select(...dbEntity.loyalCustomerEntity, ...listEntity)
        .join("customers", "customers.id", "loyalCustomers.customerId");

      return res.status(200).send({
        data: data,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public updateStatusLoyalCustomer = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerId;
      const { status = "active" } = req.body;
      const data = await LoyalCustomer.query()
        .update({ status: status })
        .where("id", id);

      return res.status(200).send({
        data: data,
        message: "update successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };


  public getLoyaCustomerBySuppIdAndCusId = async (req: any, res: any, next: any) => {
    // console.log('aewdae')
    try {
      const supplierId = req.query.supplierId;
      const status = 'active';
      const customerId = req.user.id;

      // console.log(supplierId)

      const data = await LoyalCustomer.query()
        .select(...dbEntity.loyalCustomerEntity)
        .where('supplierId', supplierId)
        .andWhere('customerId', customerId)
        .andWhere('status', status)

      return res.status(200).send({
        message: 'successful',
        data: data
      })
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };

  public getLoyalCustomerByLoginCustomer = async (req: any, res: any, next: any) => {
    try {
      const customerId = req.user.id;
      // console.log('testtttttttttt')

      const data = await LoyalCustomer.query().select(...dbEntity.loyalCustomerEntity)
        .where('customerId', customerId).first();

      // console.log(data.supplierId)

      const supplierInfor = await Suppliers.query().select(...dbEntity.supplierEntity).where('id', data.supplierId);

      return res.status(200).send({
        message: 'successful',
        data: ({ loyalCustomer: data, supplierInfor: supplierInfor })
      })
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };
}

export default new LoyalcustomerController();
