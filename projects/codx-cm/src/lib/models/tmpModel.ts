import { Util } from 'codx-core';
import {
  DP_Processes_Permission,
  DP_Processes_Ratings,
  DP_Steps,
} from 'projects/codx-dp/src/lib/models/models';

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
