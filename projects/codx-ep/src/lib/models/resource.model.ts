export class Resource {
  resourceID: string;
  resourceName: string;
  capacity: number;
  equipments: Array<object>;
}

export class ResourceTrans {
  transID:string;
  transType:string;
  transDate :Date;
  resourceType:string;
  resourceID:string;
  note:string;
  userID:string;
  employeeID:string;
  positionID:string;
  orgUnitID:string;
  departmentID:string;
  companyID:string;
  createdBy:string;
}

export class Warehouses {
  warehouseID: string;
  owner: string;
  createdBy: string;
  createdOn: Date;
  reservedQty: number;
  availableQty: number;
  currentQty: number;
}