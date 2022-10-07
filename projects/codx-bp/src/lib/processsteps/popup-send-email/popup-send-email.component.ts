import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';

@Component({
  selector: 'lib-popup-send-email',
  templateUrl: './popup-send-email.component.html',
  styleUrls: ['./popup-send-email.component.css'],
})
export class PopupSendEmailComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  headerText: string = '';
  subHeaderText: string = '';
  dialog: DialogRef;
  formModel: FormModel;
  user: any;
  data: any;
  gridViewSetup: any;
  lstFrom = [];
  lstTo = [];
  lstBcc = [];
  lstCc = []
  showCC = true;
  showBCC=true ;
  vllShare = 'TM003';
  message ='tesstttttttttttttttttttttttttttttttttt'
  objectID:any
  //
  constructor(
    private bpService: CodxBpService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.user = this.authStore.get();
  }

  deleteUser(item, index) {}

  eventApply(event) {}

  changeSendType(e) {}

  valueChange(e){

  }

  fileAdded(e){

  }

  getfileCount(e){

  }

  sendMail(){

  }

  click(){

  }

  addFile(e){
    this.attachment.uploadFile();
  }
}
