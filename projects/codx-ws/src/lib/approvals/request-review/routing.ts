import { ViewDetailComponent  as OD_ViewDetail} from "projects/codx-od/src/lib/incomming/view-detail/view-detail.component";
import { ViewDetailComponent as ES_ViewDetail} from "projects/codx-es/src/lib/sign-file/view-detail/view-detail.component";
import { CodxViewDetailBookingComponent } from "projects/codx-share/src/lib/components/codx-booking/codx-view-detail-booking/codx-view-detail-booking.component";
import { CashpaymentDetailComponent } from "projects/codx-ac/src/lib/vouchers/cashpayments/cashpayments-detail/cashpayment-detail.component";
export let componentsDetail = {
    //Công văn
    cpnDtDispatches: OD_ViewDetail,
    //Trình ký
    cpnDtESSignFile: ES_ViewDetail,
    //Dịch vụ hành chính
    cpnDtEPBooking: CodxViewDetailBookingComponent,

    //AC - CashPayment
    cpnCashPayment: CashpaymentDetailComponent 

  };