class Entity {
  accountEntity = [
    "accounts.id as id",
    "accounts.username as username",
    "accounts.password as password",
    "accounts.phone as phone",
    "accounts.roleId as roleid",
    "accounts.googleId as googleid",
    "accounts.isDeleted as isdeleted",
    "accounts.reasonForEnabling as reasonforenabling",
    "accounts.reasonForDisabling as reasonfordisabling",
  ];

  customerEntity = [
    "customers.id as id",
    "customers.accountId as accountid",
    "customers.firstName as firstname",
    "customers.lastName as lastname",
    "customers.email as email",
    "customers.avt as avt",
    "customers.isDeleted as isdeleted",
    "customers.createdAt as createdat",
    "customers.updatedAt as updatedat",
    "customers.eWalletSecret as ewalletsecret",
    "customers.eWalletCode as ewalletcode",
  ];

  supplierEntity = [
    "suppliers.id as id",
    "suppliers.accountId as accountid",
    "suppliers.name as name",
    "suppliers.email as email",
    "suppliers.avt as avt",
    "suppliers.isDeleted as isdeleted",
    "suppliers.createdAt as createdat",
    "suppliers.updatedAt as updatedat",
    "suppliers.address as address",
    "suppliers.eWalletSecret as ewalletsecret",
    "suppliers.eWalletCode as ewalletcode",
    "suppliers.identificationCard as identificationcard",
    "suppliers.identificationImage as identificationimage",
  ];

  systemProfileEntity = [
    "systemProfiles.id as id",
    "systemProfiles.accountId as accountid",
    "systemProfiles.name as name",
    "systemProfiles.avt as avt",
    "systemProfiles.isDeleted as isdeleted",
    "systemProfiles.createdAt as createdat",
    "systemProfiles.updatedAt as updatedat",
  ];

  roleEntity = ["roles.id as id", "roles.roleName as rolename"];

  categoryEntity = [
    "categories.id as id",
    "categories.categoryName as categoryname",
    "categories.supplierId as supplierid",
    "categories.isDeleted as isdeleted",
    "categories.createdAt as createdat",
    "categories.updatedAt as updatedat",
  ];

  campaignEntity = [
    "campaigns.id as id",
    "campaigns.productId as productid",
    "campaigns.status as status",
    "campaigns.createdAt as createdat",
    "campaigns.updatedAt as updatedat",
    "campaigns.fromDate as fromdate",
    "campaigns.toDate as todate",
    "campaigns.quantity as quantity",
    "campaigns.price as price",
    "campaigns.code as code",
    "campaigns.description as description",
    "campaigns.maxQuantity as maxquantity",
    "campaigns.isShare as isshare",
    "campaigns.advanceFee as advancefee",
    "campaigns.productName as productname",
    "campaigns.image as image",
    "campaigns.range as range",
  ];

  productEntity = [
    "products.id as id",
    "products.name as name",
    "products.retailPrice as retailprice",
    "products.quantity as quantity",
    "products.image as image",
    "products.categoryId as categoryid",
    "products.description as description",
    "products.status as status",
    "products.createdAt as createdat",
    "products.updatedAt as updatedat",
  ];

  loyalCustomerEntity = [
    "loyalCustomers.id as id",
    "loyalCustomers.supplierId as supplierid",
    "loyalCustomers.customerId as customerid",
    "loyalCustomers.numOfOrder as numoforder",
    "loyalCustomers.numOfProduct as numofproduct",
    "loyalCustomers.discountPercent as discountpercent",
    "loyalCustomers.createdAt as createdat",
    "loyalCustomers.updatedAt as updatedat",
    "loyalCustomers.status as status",
  ];

  orderEntity =[
    "orders.id as id",
    "orders.status as status",
    "orders.address as address",
    "orders.paymentMethod as paymentmethod",
    "orders.customerId as customerid",
    "orders.paymentId as paymentid",
    "orders.createdAt as createdat",
    "orders.updatedAt as updatedat",
    "orders.discountPrice as discountprice",
    "orders.shippingFee as shippingfee",
    "orders.orderCode as ordercode",
    "orders.totalPrice as totalprice",
    "orders.customerDiscountCodeId as customerdiscountcodeid",
  ]

  campaignOrderEntity= [
    "campaignOrders.id as id",
    "campaignOrders.quantity as quantity",
    "campaignOrders.price as price",
    "campaignOrders.note as note",
    "campaignOrders.customerId as customerid",
    "campaignOrders.status as status",
    "campaignOrders.address as address",
    "campaignOrders.paymentId as paymentid",
    "campaignOrders.shippingFee as shippingfee",
    "campaignOrders.advancedId as advancedid",
    "campaignOrders.advanceFee as advancefee",
    "campaignOrders.createdAt as createdat",
    "campaignOrders.updatedAt as updatedat",
    "campaignOrders.orderCode as ordercode",
    "campaignOrders.discountPrice as discountprice",
    "campaignOrders.totalPrice as totalprice",
    "campaignOrders.paymentMethod as paymentmethod",
    "campaignOrders.campaignId as campaignid",
    "campaignOrders.comment as comment",
    "campaignOrders.rating as rating",
  ]

  orderDetailEntity = [
    "orderDetails.id as id",
    "orderDetails.productName as productname",
    "orderDetails.quantity as quantity",
    "orderDetails.price as price",
    "orderDetails.note as note",
    "orderDetails.orderCode as ordercode",
    "orderDetails.productId as productid",
    "orderDetails.totalPrice as totalprice",
    "orderDetails.image as image",
    "orderDetails.orderId as orderid",
    "orderDetails.comment as comment",
    "orderDetails.rating as rating",
    "orderDetails.createdAt as createdat",
    "orderDetails.updatedAt as updatedat",
  ]

  orderStatusHistoriesEntity = [
    "orderStatusHistories.id as id",
    "orderStatusHistories.campaignOrderId as campaignorderid",
    "orderStatusHistories.orderCode as ordercode",
    "orderStatusHistories.orderStatus as orderstatus",
    "orderStatusHistories.image as image",
    "orderStatusHistories.description as description",
    "orderStatusHistories.createdAt as createdat",
    "orderStatusHistories.updatedAt as updatedat",
    "orderStatusHistories.retailOrderId as retailorderid",
    "orderStatusHistories.type as type",
  ]

  discountCodeEntity=[
    "discountCodes.id as id",
    "discountCodes.supplierId as supplierid",
    "discountCodes.code as code",
    "discountCodes.description as description",
    "discountCodes.minimumPriceCondition as minimumpricecondition",
    "discountCodes.startDate as startdate",
    "discountCodes.endDate as enddate",
    "discountCodes.quantity as quantity",
    "discountCodes.createdAt as createdat",
    "discountCodes.updatedAt as updatedat",
    "discountCodes.status as status",
    "discountCodes.discountPrice as discountprice",
  ]
  transactionEntity = [
    "transactions.id as id",
    "transactions.supplierId as supplierid",
    "transactions.amount as amount",
    "transactions.orderCode as ordercode",
    "transactions.advanceFee as advancefee",
    "transactions.orderValue as ordervalue",
    "transactions.paymentFee as paymentfee",
    "transactions.platformFee as platformfee",
    "transactions.penaltyFee as penaltyfee",
    "transactions.type as type",
    "transactions.isWithdrawable as iswithdrawable",
    "transactions.description as description",
    "transactions.content as content",
    "transactions.status as status",
    "transactions.createdAt as createdat",
    "transactions.updatedAt as updatedat",
    "transactions.paymentLink as paymentlink",
  ];

  chatEntity = [
    "chatMessages.id as id",
    "chatMessages.from as from",
    "chatMessages.to as to",
    "chatMessages.createdAt as createdat",
    "chatMessages.updatedAt as updatedat",
    "chatMessages.message as message",
    "chatMessages.file as file",
    "chatMessages.status as status",
  ];
}
export default new Entity();
