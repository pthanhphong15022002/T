import { Util } from 'codx-core';

export class tmpInstances {
  recID: string = Util.uid();
  processID: string;
  instanceNo: string;
  stepID: string;
  title: string;
  memo: string;
  status: string;
  endDate: Date;
  owner: string;
  startDate: Date;
}

export class tmpInstancesStepsReasons {
  recID: string = Util.uid();
  processID: string;
  instanceID: string;
  stepID: string;
  reasonName: string;
  reasonType: string;
  createdOn: Date = new Date();
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
export class tmpInstancesStepsRoles {
  recID: string;
  instanceID: string;
  stepID: string;
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

export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}
