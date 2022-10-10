import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  AuthStore,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-adr',
  templateUrl: './popup-adr.component.html',
  styleUrls: ['./popup-adr.component.scss'],
})
export class PopupADRComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    private notify: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    this.user = this.authStore.get();
  }

  okClick = false;
  data;
  title: string;
  subTitle: string;
  mode;
  funcID;
  recID;

  dialog;
  approvalTrans: any = {};

  formModel: FormModel;
  dialogSignFile: FormGroup;
  controlName;

  cbxName;

  user;
  onInit(): void {
    this.title = this.data.title;
    this.subTitle = this.data.subTitle;
    this.mode = this.data.mode;
    this.funcID = this.data.funcID;
    this.recID = this.data.signfileID;
    this.formModel = this.data.formModel;
    this.formModel.currentData = this.approvalTrans;
    this.dialogSignFile = this.data.formGroup;
    this.controlName = this.mode == 2 ? 'rejectControl' : 'redoControl';

    this.detectorRef.detectChanges();
  }

  getfileCount(event) {}

  changeReason(e) {}

  saveDialog() {
    this.notify.notifyCode('ES011');
    console.log('form model', this.formModel);
    console.log('dialogSignFile model', this.dialogSignFile);
    if (this.formModel.currentData.comment != '') {
      this.dialog.close(this.mode);
    }
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
