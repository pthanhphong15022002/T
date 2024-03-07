import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'bp-sign-pdf',
  templateUrl: './bp-sign-pdf.component.html',
  styleUrls: ['./bp-sign-pdf.component.css'],
})
export class BpSignPDFComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  dialog: any;
  dynamicApprovers=[];
  processID: any;
  fileIDs: any;
  constructor(
    private authstore: AuthStore,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.dynamicApprovers = dt?.data?.dynamicApprovers;
    this.processID = dt?.data?.processID;
    this.fileIDs = dt?.data?.fileIDs;
  }
  ngOnInit(): void {
    
  }
  close(){
    this.dialog && this.dialog.close()
  }
  
}
