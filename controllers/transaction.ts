import { Transaction } from "../models/transaction";

class TransactionController {
  public createTransaction = async (transaction: Transaction) => {
    try {
      await Transaction.query().insert({
        ...transaction,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (transaction: Transaction) => {
    try {
      await Transaction.query()
        .update({
          ...transaction,
        })
        .where("ordercode", transaction.ordercode);
    } catch (error) {
      console.log(error);
    }
  };
}

export default new TransactionController();
