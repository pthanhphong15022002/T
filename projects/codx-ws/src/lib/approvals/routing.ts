import { IncommingComponent } from "projects/codx-od/src/lib/incomming/incomming.component";
import { EmployeeContractComponent } from "projects/codx-hr/src/lib/employee-contract/employee-contract.component";
import { SignFileComponent } from "projects/codx-es/src/lib/sign-file/sign-file.component";
import { RequestReviewComponent } from "./request-review/request-review.component";
import { EPApprovalComponent } from "projects/codx-ep/src/lib/approval/ep-approval.component";
import { CashPaymentsComponent } from "projects/codx-ac/src/lib/vouchers/cashpayments/cashpayments.component";

//Routing component xét duyệt
export let components = {
    cpnApproval: RequestReviewComponent,
    //Công văn
    cpnDispatches: IncommingComponent,
    //Nhân sự
    cpnEmployeeContract : EmployeeContractComponent,
    //Trình ký
    cpnSignFile : SignFileComponent,
    //Dịch vụ hành chính
    cpnBooking : EPApprovalComponent,
    //AC - Phiếu chi
    cpnCashPayment: CashPaymentsComponent
  };
