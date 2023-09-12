import { IncommingComponent } from "projects/codx-od/src/lib/incomming/incomming.component";
import { RequestReviewComponent } from "./request-review/request-review.component";

//Routing component xét duyệt
export var components = {
    cpnApproval: RequestReviewComponent,
    //Công văn
    cpnDispatches: IncommingComponent
  };
  