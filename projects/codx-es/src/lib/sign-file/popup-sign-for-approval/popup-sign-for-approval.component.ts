import { HttpClient } from '@angular/common/http';
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
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { PdfComponent } from 'projects/codx-share/src/lib/components/pdf/pdf.component';
import { threadId } from 'worker_threads';
import { CodxEsService } from '../../codx-es.service';
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
    private http: HttpClient,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    console.log(this.data);

    this.user = this.authStore.get();
  }

  @ViewChild('pdfView') pdfView: PdfComponent;
  @ViewChild('popupOTPPin', { static: false }) popupOTPPin: TemplateRef<any>;

  isAfterRender: boolean = false;
  isConfirm = false;
  isApprover = true;
  stepNo;
  dialog;
  data;
  user;
  signerInfo: any = {};

  formModel: FormModel;
  dialogSignFile: FormGroup;

  confirmValue: string = '';

  sfRecID = '';
  transRecID = null;
  funcID;
  canOpenSubPopup;

  mode;
  title: string;
  subTitle: string;

  onInit(): void {
    this.canOpenSubPopup = false;
    this.funcID = this.data ? this.data.funcID : 'EST01';
    this.canOpenSubPopup = this.data?.status == 3 ? true : false;
    this.stepNo = this.data?.stepNo;
    console.log('step no', this.stepNo);

    this.sfRecID = this.data.sfRecID;
    this.transRecID = this.data.transRecID;
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

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event?.field == 'otpPin') {
        this.confirmValue = event?.data;
      }
    }
  }

  confirmOTPPin() {
    if (this.confirmValue != '') {
      if (this.confirmValue === this.signerInfo.otpPin) {
        this.approve(this.mode, this.title, this.subTitle);
      } else {
        this.notify.notify('Giá trị không hợp lệ!');
      }
    } else {
      this.notify.notify('Nhập giá trị');
    }
  }

  changeConfirmState(state: boolean) {
    this.isConfirm = state;
  }

  clickOpenPopupADR(mode) {
    if (!this.canOpenSubPopup && !this.isConfirm) {
      return;
    }
    this.mode = mode;
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
    this.title = title;
    this.subTitle = subTitle;
    if (this.data.stepType == 'S' && this.signerInfo?.otpControl == '3') {
      this.openConfirm();
    } else {
      this.approve(mode, title, subTitle);
    }
  }

  openConfirm() {
    let dialogOtpPin = this.callfc.openForm(
      this.popupOTPPin,
      '',
      350,
      410,
      this.funcID
    );
  }

  approve(mode, title: string, subTitle: string) {
    let dialogADR = this.callfc.openForm(
      PopupADRComponent,
      title,
      500,
      500,
      this.funcID,
      {
        signfileID: this.sfRecID,
        mode: mode,
        title: title,
        subTitle: subTitle,
        funcID: this.funcID,
        formModel: this.formModel,
        formGroup: this.dialogSignFile,
        stepType: this.data.stepType,
      }
    );
    this.pdfView.curPage = this.pdfView.pageMax;
    dialogADR.closed.subscribe((res) => {
      console.log('res.event', res.event);
      if (res.event) {
        this.pdfView
          .signPDF(mode, this.dialogSignFile.value.comment)
          .then((value) => {
            if (value) {
              let result = {
                result: true,
                mode: mode,
              };
              this.notify.notifyCode('RS002');
              this.canOpenSubPopup = false;
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

  clickUSB() {
    let signatureBase64 = '';
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;
    let page = 0;

    this.esService.getPDFBase64(this.pdfView.curFileID).subscribe((data) => {
      this.http
        .post('http://localhost:6543/DigitalSignature/Sign', data)
        .subscribe((o) => {
          console.log(o);
        });
    });
  }

  changeActiveOpenPopup(e) {
    console.log('active', e);
  }

  changeSignerInfo(event) {
    if (event) {
      this.signerInfo = event;
    }
  }

  saveDialog() {
    this.dialog.close();
  }

  close(dialog: DialogRef = null) {
    if (dialog != null) {
      this.confirmValue = '';
      dialog && dialog.close();
    } else {
      this.dialog && this.dialog.close();
    }
  }
}
