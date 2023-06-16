export class OKRs {
    recID:string;
    year:number;
    periodID:string;
    numbererval:string;
    sorting:number;
    okrLevel:string;
    okrType:string;
    okrName:string;
    category:string;
    confidence:string;
    tags:string;
    memo:string;
    measurement:string;
    timeline:string;
    status:string;
    progress:number;
    weight:number;
    current:number;
    target:number;
    actual:number;
    uMID:string;
    plan:string;
    frequence:string;
    checkIn:string;
    checkInMode:string;
    lastCheckIn:Date;
    alignment:string;
    parentID:string;
    approveControl:string;
    approveStatus:string;
    note:string;
    kRs:number;
    tasks:number;
    attachments:number;
    comments:number;
    autoCreated:boolean;
    stop:boolean;
    targets:Targets[];
    checkIns:CheckIns[];
    shares:Shares[];
    notes:object[];
    updates:object[];
    visibility:string;
    positionID:string;
    orgUnitID:string;
    deptID:string;
    divisionID:string;
    owner:string;
    bUID:string;
    createdOn:Date;
    createdBy:string;
    modifiedOn:Date;
    modifiedBy:string;
  }
  export class Targets {
    recID:string;
    oKRID:string;
    period:string;
    planDate:Date;
    target:number;
    comment:string;
    createdOn:Date;
    createdBy:string;
    modifiedOn:Date;
    modifiedBy:string;
    //Custom
    startMonth:number;
  }

  export class CheckIns{
    okrid:string;
    okrStatus:string;
    checkIn:Date;
    value:number;
    cummulated:number;
    status:string;
    comment:string;
    positionName:string;
  }
  export class Shares{
    
    objectType:string;
    objectID:string;
    permission:string;
    read:number;
    view:number;
    write:number;
    delete:number;
    download:number;
    upload:number;
    share:number;
    startedOn:Date;
    expiredOn:Date;
    note:string;
    autoCreated:boolean;
    createdOn:Date;
    createdBy:string;
    modifiedOn:Date;
    modifiedBy:string;
  }

  export class Links{
    recID:string;
    oKRID:string;
    refID:string;
    refType:string;
    objectType:string;
    objectID:string;
    distributePct:number;
    distributeValue:number;
    comment:string;
    createdOn:Date;
    createdBy:string;
    modifiedOn:Date;
    modifiedBy:string;
  }

  export class EditWeight{
    recID:string;
    index:number;
    weight:number;
    pbyw:number;
    progress:number;
  }

  export class OM_TabModel {
    name: string;
    textDefault: string;
    isActive: boolean;
    icon:string;
  }

  export class OM_Statistical {
    percentOBDone: string='0';
    percentOBStarting: string='0';
    percentOBNotStart: string='0';

    totalOB:number=0;
    totalHighOB:number=0;
    obDone:number=0;
    highOBDone:number=0;

    krLateCheckIn:number=0;
    krLateProgress:number=0;
    krInProgress:number=0;
    krOverProgress:number=0;
  }

  export class OM_PlanVersion {
    versionName: string;
    versionNo: string;
    comment: string;
    activedOn :Date;

  }