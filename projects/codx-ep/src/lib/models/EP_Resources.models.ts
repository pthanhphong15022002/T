import { Equipments } from './equipments.model';

export class EP_Resources {
  id?: string;
  recID: string;
  resourceID?: string;
  ResourceName: string;
  ResourceName2?: string;
  ResourceType: string;
  umid?: string;
  ranking?: string;
  category?: string;
  groupID?: string;
  location?: string;
  companyID?: string;
  area: number;
  capacity: number;
  icon?: string;
  color?: string;
  code?: string;
  equipments?: [Equipments];
  currentQty: number;
  reservedQty: number;
  availableQty: number;
  costPrice: number;
  status: string;
  calendarID?: string;
  approval?: string;
  approvers?: string;
  linkType?: string;
  linkID?: string;
  refType?: string;
  refID?: string;
  note?: string;
  owner?: string;
  buid?: string;
  createdBy: string;
}

export class tempResources extends EP_Resources {
    quantity: number = 0;
}
