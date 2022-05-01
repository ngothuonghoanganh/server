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
}
export default new Entity();
