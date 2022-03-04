import { LoyalCustomerCondition } from "../models/loyalCustomerCondition";

class LoyalcustomerController {
  public create = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent } = req.body;
      const supplierId = req.user.id;

      const newConditon = await LoyalCustomerCondition.query().insert({
        supplierid: supplierId,
        minorder: minOrder,
        minproduct: minProduct,
        discountpercent: discountPercent,
      });

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent } = req.body;
      const id = req.params.loyalCustomerConditionId;

      const newConditon = await LoyalCustomerCondition.query()
        .update({
          minorder: minOrder,
          minproduct: minProduct,
          discountpercent: discountPercent,
        })
        .where("id", id);

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
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
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAll = async (req: any, res: any, next: any) => {
    try {
      const condition = await LoyalCustomerCondition.query().select();

      return res.status(200).send({
        data: condition,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new LoyalcustomerController();
