import { IncommingComponent } from "projects/codx-od/src/lib/incomming/incomming.component";
import { RequestReviewComponent } from "./request-review/request-review.component";
import { EmployeeContractComponent } from "projects/codx-hr/src/lib/employee-contract/employee-contract.component";

//Routing component xét duyệt
export var components = {
    cpnApproval: RequestReviewComponent,
    //Công văn
    cpnDispatches: IncommingComponent,
    //Nhân sự
    cpnEmployeeContract : EmployeeContractComponent
  };
  