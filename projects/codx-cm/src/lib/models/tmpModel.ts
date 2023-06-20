import { Util } from "codx-core";
import { DP_Processes_Permission, DP_Processes_Ratings, DP_Steps } from "projects/codx-dp/src/lib/models/models";

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
