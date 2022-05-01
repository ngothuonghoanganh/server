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
    "suppliers.id as id",
    "suppliers.accountId as accountid",
    "suppliers.name as name",
    "suppliers.avt as avt",
    "suppliers.isDeleted as isdeleted",
    "suppliers.createdAt as createdat",
    "suppliers.updatedAt as updatedat",
  ];

  roleEntity = ["roles.id as id", "roles.roleName as rolename"];
}
export default new Entity();
