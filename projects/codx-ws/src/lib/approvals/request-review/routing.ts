import { ViewDetailComponent  as OD_ViewDetail} from "projects/codx-od/src/lib/incomming/view-detail/view-detail.component";
import { ViewDetailComponent as ES_ViewDetail} from "projects/codx-es/src/lib/sign-file/view-detail/view-detail.component";
export let componentsDetail = {
    //Công văn
    cpnDtDispatches: OD_ViewDetail,
    //Trình ký
    cpnDtESSignFile: ES_ViewDetail,
  };