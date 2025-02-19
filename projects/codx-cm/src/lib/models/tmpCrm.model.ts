export class tmpCrm {
  id: string;
  name: string;
  objectType: string;
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
export class CM_Tasks {
  recID: string;
  objectType: string;
  objectID: string;
  taskType: string;
  taskName: string;
  indexNo: number;
  startDate: Date;
  endDate: Date;
  durantionDay: number;
  durationHour: number;
  reminders: string;
  reminderBy: string;
  memo: string;
  roles: CM_Tasks_Roles[] = [];
  owner: string;
  isOnline: boolean;
  callType: string;
  reference: string;
  createTask: boolean;
  lastUpDate: Date;
  comments: number;
  attachments: number;
  progress: number;
  actualEnd: Date;
  status: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
export class CM_Tasks_Roles {
  recID: string;
  taskID: string;
  roleType: string;
  objectType: string;
  objectName: string;
  objectID: string;
  note: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
