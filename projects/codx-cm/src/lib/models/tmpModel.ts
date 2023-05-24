import { Util } from "codx-core";

export class tmpInstances {
  recID: string  = Util.uid(); ;
  processID: string;
  instanceNo: string;
  stepID: string;
  title: string;
  memo: string;
  status: string;
  endDate: Date;
  owner: string;
  startDate: Date
}
