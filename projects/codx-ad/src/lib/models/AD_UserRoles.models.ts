export class AD_UserRoles {
  recID: string;
  userID: string;
  module: string;
  moduleSalse: string;
  roleID: string;
  startDate: string;
  endDate: string;
  autoCreated: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
}

export class tmpUserRoleInfo {
  userID: string;
  email: string;
  fullName: string;
  operRoleEndDate: string;
  emplRoleEndDate: string;
}

export class tmpTenantConfirm {
  orderID: string;
  userID: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyPhone: string;
  companySize: string;
  companyTarget: string;
  tenantID: string;
  agreeTerms: boolean;
  isTrial: boolean;
  isRegisUser: boolean;
  language: string;
}
