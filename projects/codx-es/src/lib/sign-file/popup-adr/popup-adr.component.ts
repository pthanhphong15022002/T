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
  approveControl: string; //'1':Ko comment;'2':ko bat buoc; '3': bat buoc
  okClick = false;
  data;
  title: string;
  subTitle: string;
  mode;
  funcID;
  recID;

  dialog;
  approvalTrans: any = {};
  grvSetup: any = {};

  formModel: FormModel;
  dialogSignFile: FormGroup;
  controlName;

  cbxName;

  user;

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
    this.cache
      .gridViewSetup(
        this.data.formModel.formName,
        this.data.formModel.gridViewName
      )
      .subscribe((grv) => {
        if (grv) this.grvSetup = grv;
      });
  }

  onInit(): void {
    this.title = this.data.title;
    this.subTitle = this.data.subTitle;
    this.mode = this.data.mode;
    this.funcID = this.data.funcID;
    this.recID = this.data.signfileID;
    this.formModel = this.data.formModel;
    console.log('form model', this.formModel);

    this.formModel.currentData = this.approvalTrans;
    this.dialogSignFile = this.data.formGroup;
    this.dialogSignFile.patchValue({ comment: '' });
    this.approvalTrans.comment = '';
    console.log('dialog', this.dialogSignFile);

    this.approveControl = this.data?.approveControl ?? '2';

    this.controlName = this.mode != 2 ? 'rejectControl' : 'redoControl';
    console.log('controlName', this.controlName);

    this.detectorRef.detectChanges();
  }

  getfileCount(event) {}

  changeReason(e) {
    if (e.field == 'comment') {
      this.approvalTrans.comment = e.data;
      this.dialogSignFile.patchValue({ comment: e.data });
    }
  }

  saveDialog() {
    if (
      this.approveControl == '3' &&
      (this.approvalTrans.comment == null || this.approvalTrans.comment == '')
    ) {
      let headerText = this.grvSetup['Comment']?.headerText ?? 'Comment';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }

    this.dialog.close(this.mode);
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
