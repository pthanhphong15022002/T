export class tmpCrm {
  recID: string;
  customerID: string;
  partnerID: string;
  opponentID: string;
  contactID: string;
  customerName: string;
  contactName: string;
  partnerName: string;
  opponentName: string;
  contactType: string;
  isCustomer: boolean = false;
  shortName: string;
  website: string;
  customerFrom: Date;
  partnerFrom: Date;
  source: string;
  taxCode: string;
  birthday: Date;
  sizing: string;
  type: string;
  field: string;
  career: string;
  revenue: number;
  bankAccount: string;
  bankName: string;
  memo: string;
  priority: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
  objectType: string;
  objectID: string;
  jobTitle: string;
  phoneNumber: string;
  email: string;
  allowCall: boolean = true;
  allowEmail: boolean = true;
  disadvantage: string;
  advantage: string;
  contacts: CM_Contacts[];
  address: CM_Address[];
}

export class CM_Contacts {
  recID: string;
  contactID: string;
  contactName: string;
  contactType: string;
  website: string;
  isCustomer: boolean = false;
  customerFrom: Date;
  source: string;
  birthday: Date;
  type: string;
  field: string;
  career: string;
  bankAccount: string;
  bankName: string;
  objectType: string;
  objectID: string;
  jobTitle: string;
  memo: string;
  phoneNumber: string;
  email: string;
  allowCall: boolean = true;
  allowEmail: boolean = true;
  address: CM_Address[];
  priority: string;
  createdOn: boolean;
  createdBy: string;
  modifiedOn: boolean;
  modifiedBy: string;
}

export class CM_Address {
  recID: string;
  objectType: string;
  objectID: string;
  addressType: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
