import { IncommingComponent } from "projects/codx-od/src/lib/incomming/incomming.component";
import { EmployeeContractComponent } from "projects/codx-hr/src/lib/employee-contract/employee-contract.component";
import { ViewDetailComponent  as OD_ViewDetail} from "projects/codx-od/src/lib/incomming/view-detail/view-detail.component";
import { SignFileComponent } from "projects/codx-es/src/lib/sign-file/sign-file.component";
import { ViewDetailComponent as ES_ViewDetail} from "projects/codx-es/src/lib/sign-file/view-detail/view-detail.component";
import { RequestReviewComponent } from "./request-review/request-review.component";

//Routing component xét duyệt
export var components = {
    cpnApproval: RequestReviewComponent,
    //Công văn
    cpnDispatches: IncommingComponent,
    //Nhân sự
    cpnEmployeeContract : EmployeeContractComponent,
    //Trình ký
    cpnSignFile : SignFileComponent
  };

export const componentsDetail = {
  //Công văn
  cpnDtDispatches: OD_ViewDetail,
  //Trình ký
  cpnDtESSignFile: ES_ViewDetail,
};