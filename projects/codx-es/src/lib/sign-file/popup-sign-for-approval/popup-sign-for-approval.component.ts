import {
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AnnotationDataFormat,
  PdfViewerComponent,
} from '@syncfusion/ej2-angular-pdfviewer';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { threadId } from 'worker_threads';
import { CodxEsService } from '../../codx-es.service';
import { PdfComponent } from '../pdf/pdf.component';
import { PopupADRComponent } from '../popup-adr/popup-adr.component';

@Component({
  selector: 'lib-popup-sign-for-approval',
  templateUrl: './popup-sign-for-approval.component.html',
  styleUrls: ['./popup-sign-for-approval.component.scss'],
})
export class PopupSignForApprovalComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private notify: NotificationsService,
    private authStore: AuthStore,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    this.user = this.authStore.get();
  }

  @ViewChild('pdfView') pdfView: PdfComponent;

  isAfterRender: boolean = false;
  isApprover = true;
  dialog;
  data;
  user;
  // data = {
  //   funcID: 'EST021',
  //   recID: 'fda05e5c-24e7-11ed-a51b-d89ef34bb550',
  // };

  formModel: FormModel;
  dialogSignFile: FormGroup;

  recID = '';
  // recID = '';
  funcID;
  cbxName;

  canOpenSubPopup;

  onInit(): void {
    this.canOpenSubPopup = false;
    this.funcID = this.data ? this.data.funcID : 'EST01';
    this.canOpenSubPopup = this.data?.status == 3 ? true : false;

    this.recID = this.data
      ? this.data.recID
      : '8d52a9dc-24ed-11ed-9451-00155d035517';
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
      this.esService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          if (res) {
            this.dialogSignFile = res;
            this.isAfterRender = true;
            this.detectorRef.detectChanges();
          }
        });
    });
  }

  clickOpenPopupADR(mode) {
    let title = '';
    let subTitle = 'Comment khi duyệt';
    switch (mode) {
      case 1:
        title = 'Duyệt';
        break;
      case 2:
        title = 'Từ chối';
        break;
      case 3:
        title = 'Làm lại';
        break;
      default:
        return;
    }
    let dialogADR = this.callfc.openForm(
      PopupADRComponent,
      title,
      500,
      500,
      this.funcID,
      {
        signfileID: this.recID,
        mode: mode,
        title: title,
        subTitle: subTitle,
        funcID: this.funcID,
        formModel: this.formModel,
        formGroup: this.dialogSignFile,
      }
    );
    dialogADR.closed.subscribe((res) => {
      console.log('res.event', res.event);
      if (res.event) {
        this.pdfView
          .signPDF(mode, this.dialogSignFile.value.comment)
          .then((value) => {
            console.log('da ki', value);
            if (value) {
              let result = {
                result: true,
                mode: mode,
              };
              this.notify.notifyCode('RS002');
              this.canOpenSubPopup = false;
              //this.pdfView.reload();
              this.dialog && this.dialog.close(result);
            } else {
              this.canOpenSubPopup = false;
              let result = {
                result: false,
                mode: mode,
              };
              this.notify.notifyCode('SYS021');
              this.dialog && this.dialog.close(result);
            }
          });
      }
    });
  }

  openTempPopup(mode) {
    this.mode = mode;
    this.title = '';
    this.subTitle = 'Comment khi duyệt';
    switch (mode) {
      case 1:
        this.title = 'Duyệt';
        break;
      case 2:
        this.title = 'Từ chối';
        break;
      case 3:
        this.title = 'Làm lại';
        break;
      default:
        return;
    }
    this.onInit1();
    let dialogPopup = this.callfc.openForm(
      this.content,
      this.title,
      500,
      500,
      this.funcID
    );
    // dialogPopup.closed.subscribe((res) => {
    //   if (res.event == 'ok') {
    //     console.log('run');
    //     this.pdfView.renderAnnotPanel();
    //     this.notify.notifyCode('RS002');
    //     this.dialog && this.dialog.close();
    //   }
    // });
  }

  changeActiveOpenPopup(e) {
    console.log('active', e);
  }
  saveDialog() {
    this.dialog.close();
  }

  close(dialog: DialogRef = null) {
    if (dialog != null) {
      dialog && dialog.close();
    } else {
      this.dialog && this.dialog.close();
    }
  }

  //#region popup

  @ViewChild('attachment') attachment: AttachmentComponent;
  //@ViewChild('popupApprove1', { static: false }) content: TemplateRef<any>;
  @ViewChild('popupApprove', { static: false }) content: TemplateRef<any>;

  okClick = false;
  title: string;
  subTitle: string;
  mode;

  approvalTrans: any = {};

  controlName;

  noteData;

  onInit1() {
    // this.formModel = this.data.formModel;
    this.formModel.currentData = this.approvalTrans;
    this.controlName = this.mode == 2 ? 'rejectControl' : 'redoControl';

    this.detectorRef.detectChanges();
  }

  getfileCount(event) {}

  changeReason(e) {}

  saveDialog1(dialog1: DialogRef) {
    if (this.mode) {
      this.pdfView
        .signPDF(this.mode, this.dialogSignFile.value.comment)
        .then((value) => {
          console.log('da ki', value);
          if (value) {
            let result = {
              result: true,
              mode: this.mode,
            };
            this.notify.notifyCode('RS002');
            this.canOpenSubPopup = false;
            //this.pdfView.reload();
            dialog1 && dialog1.close(result);
            this.dialog && this.dialog.close(result);
          } else {
            this.canOpenSubPopup = false;
            let result = {
              result: false,
              mode: this.mode,
            };
            this.notify.notifyCode('SYS021');
            dialog1 && dialog1.close(result);
            this.dialog && this.dialog.close(result);
          }
        });
    }
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
  //#endregion
}
