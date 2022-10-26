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
  @ViewChild('pdfView') pdfView: PdfComponent;
  @ViewChild('popupOTPPin', { static: false }) popupOTPPin: TemplateRef<any>;

  isAfterRender: boolean = false;
  isConfirm = true;
  isApprover = true;
  otpControl: string = ''; //'1':SMS;2:Email;3:OTP
  stepNo: number;
  dialog: DialogRef;
  data;
  user;
  signerInfo: any = {};

  formModel: FormModel;
  dialogSignFile: FormGroup;

  confirmValue: string = '';

  sfRecID = '';
  transRecID = null;
  funcID;
  oApprovalTrans: any = {};
  canOpenSubPopup;

  mode;
  title: string;
  subTitle: string;

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
    this.oApprovalTrans = dt?.data?.oTrans;
    if (this.oApprovalTrans?.confirmControl == '1') {
      this.isConfirm = false;
    }

    this.user = this.authStore.get();
  }

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
      if (this.otpControl == '1' || this.otpControl == '2') {
        this.esService
          .confirmOTPPin(this.oApprovalTrans.recID, this.confirmValue)
          .subscribe((res) => {
            if (res) {
              this.approve(this.mode, this.title, this.subTitle);
            } else {
              this.notify.notifyCode('ES014');
            }
          });
      } else if (
        this.otpControl == '3' &&
        this.confirmValue === this.signerInfo.otpPin
      ) {
        this.approve(this.mode, this.title, this.subTitle);
      } else {
        this.notify.notifyCode('ES014');
      }
    } else {
      this.notify.notify('Nhập giá trị');
    }
  }

  changeConfirmState(state: boolean) {
    if (this.oApprovalTrans.confirmControl == '1') {
      this.isConfirm = state;
    }
  }

  checkConfirm(mode) {
    if (this.canOpenSubPopup && this.oApprovalTrans?.confirmControl == '1') {
      if (!this.isConfirm) this.notify.notifyCode('ES011');
    }
  }

  clickOpenPopupADR(mode) {
    if (!this.isConfirm) {
      this.notify.notifyCode('ES011');
      return;
    }
    if (!this.canOpenSubPopup) {
      return;
    }
    this.mode = mode;
    let title = '';
    let subTitle = 'Comment khi duyệt';
    switch (mode) {
      case 5:
        title = 'Duyệt';
        break;
      case 4:
        title = 'Từ chối';
        break;
      case 2:
        title = 'Làm lại';
        break;
      default:
        return;
    }
    this.title = title;
    this.subTitle = subTitle;
    if (
      this.data.stepType == 'S' &&
      (this.signerInfo?.otpControl == '1' ||
        this.signerInfo?.otpControl == '2' ||
        this.signerInfo?.otpControl == '3')
    ) {
      this.otpControl = this.signerInfo.otpControl;
      this.openConfirm();
    } else {
      this.approve(mode, title, subTitle);
    }
  }

  openConfirm() {
    if (this.otpControl == '2') {
      this.esService.createOTPPin(this.oApprovalTrans.recID, 1).subscribe();
    }
    let dialogOtpPin = this.callfc.openForm(
      this.popupOTPPin,
      '',
      350,
      410,
      this.funcID
    );
  }

  approve(mode, title: string, subTitle: string) {
    if (this.oApprovalTrans?.approveControl != '1') {
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
          approveControl: this.oApprovalTrans?.approveControl,
        }
      );
      this.pdfView.curPage = this.pdfView.pageMax;
      dialogADR.closed.subscribe((res) => {
        console.log('res.event', res.event);
        if (res.event) {
          switch (this.pdfView.signerInfo.signType) {
            case '2': {
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
              break;
            }

            case '1': {
              switch (this.signerInfo.supplier) {
                //usb
                case '5': {
                  this.esService
                    .getSignContracts(
                      this.sfRecID,
                      this.pdfView.curFileID,
                      this.pdfView.curFileUrl,
                      this.stepNo
                    )
                    .subscribe(async (lstContract) => {
                      if (lstContract) {
                        let finalContract = await this.signContract(
                          lstContract,
                          0,
                          this.dialogSignFile.value.comment
                        );
                        if (finalContract) {
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
                      }
                    });
                  break;
                }
              }
              break;
            }
          }
        }
      });
    } else {
      switch (this.pdfView.signerInfo.signType) {
        case '2': {
          this.pdfView.signPDF(mode, '').then((value) => {
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
          break;
        }

        case '1': {
          switch (this.signerInfo.supplier) {
            //usb
            case '5': {
              this.esService
                .getSignContracts(
                  this.sfRecID,
                  this.pdfView.curFileID,
                  this.pdfView.curFileUrl,
                  this.stepNo
                )
                .subscribe(async (lstContract) => {
                  if (lstContract) {
                    let finalContract = await this.signContract(
                      lstContract,
                      0,
                      this.dialogSignFile.value.comment
                    );
                    if (finalContract) {
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
                  }
                });
              break;
            }
          }
          break;
        }
      }
    }
  }

  clickUSB() {}

  async signContract(lstContract, idx: number, comment) {
    //chua ki xong
    return new Promise<any>((resolve, rejects) => {
      this.http
        .post('http://localhost:6543/DigitalSignature/Sign', lstContract[idx])
        .subscribe((res: any) => {
          idx += 1;
          //ky xong
          if (idx == lstContract.length) {
            this.esService
              .saveUSBSignPDF(
                this.transRecID,
                this.sfRecID,
                this.pdfView.curFileID,
                res.fileBase64ContentSigned,
                comment
              )
              .subscribe((saveEvent) => {
                console.log('save', saveEvent);
                resolve(saveEvent);
                return saveEvent;
              });
          } else {
            lstContract[idx - 1] = res;
            lstContract[idx].fileBase64Content = res.fileBase64ContentSigned;
            lstContract = this.signContract(lstContract, idx, comment);
          }
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
