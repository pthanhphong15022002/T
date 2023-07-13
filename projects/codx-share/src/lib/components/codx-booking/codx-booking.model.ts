export class Equipments {
    equipmentID:string;
    createdBy: string;
    createdOn: Date;
    isPicked:boolean;
  }
  export class Device {
    id;
    text = '';
    isSelected = false;
    icon = '';
    createdBy = null;
    createdOn = null;
  }
  export class Resource {
    resourceID: string;
    resourceName: string;
    capacity: number;
    useCard: boolean;
    equipments: Array<object>;
    owner :string;
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
  export class BookingAttendees {
    userID: string;
    userName: string;
    positionName: string;
    roleType: string;
    status: string;
    optional: boolean;    
    icon: string;
    roleName:string;
    quantity: number;
  }
  export class DriverModel {
    driverID: string;
    driverName: string;    
  }
  export class BookingItems {
    itemID: string;
    quantity: number;
    itemName: string;
    objectType: string;
    umid: string;
    umName: string;
    objectID: string;
  }
  export class GridModels {
    pageSize?: number;
    entityName?: string;
    entityPermission?: string;
    formName?: string;
    gridViewName?: string;
    funcID?: string;
    dataValues?: string;
    predicates?: string;
    comboboxName?: string;
  }