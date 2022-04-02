import { Campaigns } from "../models/campaigns";
import { CampaignOrder } from "../models/campaingorder";
import { Customers } from "../models/customers";
import { Order } from "../models/orders";
import { Suppliers } from "../models/suppliers";

class System {
  public getAllOrders = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const orders: any = await Order.query()
        .select(
          "orders.*",
          Order.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = orders.supplierid),json_agg(to_jsonb(orderdetail) - 'orderid') as details`
          )
        )
        .join("orderdetail", "orders.id", "orderdetail.orderid")
        .where((cd) => {
          if (status) {
            cd.where("orders.status", status);
          }
        })
        .groupBy("orders.id");

      const ordersInCampaign = await CampaignOrder.query()
        .select(
          "campaignorder.*",
          "campaigns.supplierid",
          CampaignOrder.raw(
            `(select suppliers.name as suppliername from suppliers where suppliers.id = campaigns.supplierid), 
            array_to_json(array_agg(json_build_object(
            'id','',
            'image', image,
            'price', campaignorder.price,
            'quantity', campaignorder.quantity,
            'ordercode', ordercode,
            'productid', campaignorder.productid,
            'campaignid', campaignid,
            'incampaign', true,
            'customerid', customerid,
            'totalprice', totalprice,
            'productname', campaignorder.productname,
            'notes', campaignorder.notes)
            )) as details`
          )
        )
        .join("campaigns", "campaigns.id", "campaignorder.campaignid")
        .where((cd) => {
          if (status) {
            cd.where("campaignorder.status", status);
          }
        })
        .groupBy("campaignorder.id")
        .groupBy("campaigns.id");

      orders.push(...ordersInCampaign);
      return res.status(200).send({
        message: "successful",
        data: orders,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCampaigns = async (req: any, res: any, next: any) => {
    try {
      const status = req.query.status;
      const listProductEntities = [
        "products.name as productname",
        "products.retailprice as productretailprice",
        "products.quantity as productquantity",
      ];
      const campaigns = await Campaigns.query()
        .select("campaigns.*", ...listProductEntities)
        .join("products", "campaigns.productid", "products.id")
        .where((cd) => {
          if (status) {
            cd.where("campaigns.status", status);
          }
        });

      return res.status(200).send({
        message: "successful",
        data: campaigns,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllSupplier = async (req: any, res: any, next: any) => {
    try {
      const suppliername = req.query.supplierName;
      const suppliers = await Suppliers.query()
        .select()
        .where((cd) => {
          if (suppliername) {
            cd.where("name", "like", `%${suppliername}%`);
          }
        });
      return res.status(200).send({
        message: "successful",
        data: suppliers,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCustomer = async (req: any, res: any, next: any) => {
    try {
      const customername = req.query.customerName;
      const customers = await Customers.query()
        .select()
        .where((cd) => {
          if (customername) {
            cd.where("firstname", "like", `%${customername}%`).orWhere(
              "lastname",
              "like",
              `%${customername}%`
            );
          }
        });
      return res.status(200).send({
        message: "successful",
        data: customers,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new System();
