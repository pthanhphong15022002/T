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
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { PdfComponent } from 'projects/codx-share/src/lib/components/pdf/pdf.component';
import { CodxEsService } from '../../codx-es.service';
import { PopupCommentComponent } from '../popup-comment/popup-comment.component';

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
  lstMF: any;

  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private notify: NotificationsService,
    private authStore: AuthStore,
    private codxShareService: CodxShareService,
    private http: HttpClient,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    this.lstMF = dt.data?.lstMF;
    console.log('More function', this.lstMF);

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

    this.sfRecID = this.data.sfRecID;
    this.transRecID = this.data.transRecID;
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
      this.esService
        .getMoreFunction(
          this.funcID,
          this.formModel.formName,
          this.formModel.gridViewName
        )
        .subscribe((res) => { });

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
              this.beforeApprove(this.mode, this.title, this.subTitle);
            }
          });
      } else if (this.otpControl == '3') {
        if (this.confirmValue === this.signerInfo.otpPin) {
          this.beforeApprove(this.mode, this.title, this.subTitle);
        } else {
          this.notify.notifyCode('ES014');
        }
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

  imgAreaConfig = ['S1', 'S2', 'S3'];
  clickOpenPopupADR(mf) {
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206
    let morefuncID = mf.functionID;
    this.title = mf.text ?? '';

    if (!this.isConfirm) {
      this.notify.notifyCode('ES011');
      return;
    }
    if (!this.canOpenSubPopup) {
      return;
    }

    let missingImgArea = this.pdfView?.lstAreas?.find((area) => {
      // !this.pdfView.checkIsUrl(area.labelValue) &&

      return (
        this.imgAreaConfig.includes(area.labelType) &&
        !area.labelValue.includes('/') &&
        area.signer == this.pdfView.signerInfo.authorID &&
        area.stepNo == this.pdfView.stepNo
      );
    });

    switch (morefuncID) {
      case 'SYS205': //tu choi
        this.mode = 4;
        break;
      case 'SYS206': //lam lai
        this.mode = 2;
        break;
      default: {
        if (
          morefuncID == 'SYS201' ||
          morefuncID == 'SYS202' ||
          morefuncID == 'SYS203'
        ) {
          this.mode = 5;
        }
      }
    }
    if (missingImgArea || this.pdfView.lstAreas.length == 0) {
      this.notify.alertCode('ES019').subscribe((x) => {
        if (x.event.status == 'Y') {
          //this.mode = mode;
          //let title = '';
          let subTitle = 'Comment khi duyệt';
          // switch (this.mode) {
          //   case 5:
          //     title = 'Duyệt';
          //     break;
          //   case 4:
          //     title = 'Từ chối';
          //     break;
          //   case 2:
          //     title = 'Làm lại';
          //     break;
          //   default:
          //     return;
          // }
          //this.title = title;
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
            this.beforeApprove(this.mode, this.title, subTitle);
          }
        }
      });
      // let title = missingImgArea.location.pageNumber + 1;
      // let dialogWarning = this.callfc.openForm(
      //   WarningMissImgComponent,
      //   title,
      //   500,
      //   200,
      //   this.funcID,
      //   { title: title }
      // );
      // dialogWarning.closed.subscribe((res) => {
      //   if (res?.event) {

      //   }
      // });
    } else {
      //this.mode = mode;
      //let title = '';
      let subTitle = 'Comment khi duyệt';
      // switch (mode) {
      //   case 5:
      //     title = 'Duyệt';
      //     break;
      //   case 4:
      //     title = 'Từ chối';
      //     break;
      //   case 2:
      //     title = 'Làm lại';
      //     break;
      //   default:
      //     return;
      // }
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
        this.beforeApprove(this.mode, this.title, subTitle);
      }
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

  beforeApprove(mode, title: string, subTitle: string) {
    let checkControl = this.codxShareService.beforeApprove(
      mode.toString(),
      this.oApprovalTrans,
      this.funcID,
      title,
      this.formModel
    );
    if (checkControl) {
      checkControl.closed.subscribe((res) => {
        let oComment = res?.event;
        console.log('result', res?.event);
        this.dialogSignFile.patchValue({ comment: oComment.comment });
        this.dialogSignFile.patchValue({ reasonID: oComment.reasonID });
        this.approve(mode, title, subTitle, null);
      });
    } else {
      this.approve(mode, title, subTitle, null);
    }
  }

  approve(mode, title: string, subTitle: string, comment: any) {
    // if (this.oApprovalTrans?.approveControl != '1') {
    //   // let dialogADR = this.callfc.openForm(
    //   //   PopupADRComponent,
    //   //   title,
    //   //   500,
    //   //   500,
    //   //   this.funcID,
    //   //   {
    //   //     signfileID: this.sfRecID,
    //   //     mode: mode,
    //   //     title: title,
    //   //     subTitle: subTitle,
    //   //     funcID: this.funcID,
    //   //     formModel: this.formModel,
    //   //     formGroup: this.dialogSignFile,
    //   //     stepType: this.data.stepType,
    //   //     approveControl: this.oApprovalTrans?.approveControl,
    //   //   }
    //   // );

    //   // this.pdfView.curPage = this.pdfView.pageMax;
    //   // dialogADR.closed.subscribe((res) => {
    //   //   if (res.event.toString()) {
    //   //     switch (this.pdfView.signerInfo.signType) {
    //   //       //ky noi bo
    //   //       case '2': {
    //   //         if (this.pdfView.isAwait) {
    //   //           this.pdfView
    //   //             .signPDF(mode, this.dialogSignFile.value.comment)
    //   //             .then((value) => {
    //   //               if (value) {
    //   //                 let result = {
    //   //                   result: true,
    //   //                   mode: mode,
    //   //                 };
    //   //                 this.notify.notifyCode('RS002');
    //   //                 this.canOpenSubPopup = false;
    //   //                 this.dialog && this.dialog.close(result);
    //   //               } else {
    //   //                 this.canOpenSubPopup = false;
    //   //                 let result = {
    //   //                   result: false,
    //   //                   mode: mode,
    //   //                 };
    //   //                 this.notify.notifyCode('SYS021');
    //   //                 this.dialog && this.dialog.close(result);
    //   //               }
    //   //             });
    //   //         }

    //   //         //khong doi
    //   //         else {
    //   //           switch (mode.toString()) {
    //   //             case '5': {
    //   //               this.esService
    //   //                 .updateTransAwaitingStatus(this.transRecID, false)
    //   //                 .subscribe((updateTransStatus) => {
    //   //                   if (updateTransStatus) {
    //   //                     let result = {
    //   //                       result: true,
    //   //                       mode: 9, //dang ky
    //   //                     };
    //   //                     this.pdfView
    //   //                       .signPDF(mode, this.dialogSignFile.value.comment)
    //   //                       .then((value) => {
    //   //                         if (value) {
    //   //                           let result = {
    //   //                             result: true,
    //   //                             mode: mode,
    //   //                           };
    //   //                           this.esService.setupChange.next(true);
    //   //                           this.esService.statusChange.next(mode);
    //   //                           this.notify.notifyCode('RS002');
    //   //                           this.canOpenSubPopup = false;
    //   //                         } else {
    //   //                           this.canOpenSubPopup = false;
    //   //                           this.esService
    //   //                             .updateTransAwaitingStatus(
    //   //                               this.transRecID,
    //   //                               true
    //   //                             )
    //   //                             .subscribe((updateTransStatus) => {
    //   //                               //that bai
    //   //                               this.esService.setupChange.next(true);
    //   //                               this.esService.statusChange.next(3);
    //   //                               this.notify.notifyCode('ES017');
    //   //                             });
    //   //                         }
    //   //                       });
    //   //                     this.canOpenSubPopup = false;
    //   //                     this.dialog && this.dialog.close(result);
    //   //                   } else {
    //   //                     this.canOpenSubPopup = false;
    //   //                     let result = {
    //   //                       result: false,
    //   //                       mode: mode,
    //   //                     };
    //   //                     this.notify.notifyCode('SYS021');
    //   //                     this.dialog && this.dialog.close(result);
    //   //                   }
    //   //                 });
    //   //               break;
    //   //             }
    //   //           }
    //   //         }
    //   //         break;
    //   //       }
    //   //       //ky cong khai
    //   //       case '1': {
    //   //         this.esService
    //   //           .getSignContracts(
    //   //             this.sfRecID,
    //   //             this.pdfView.curFileID,
    //   //             this.pdfView.curFileUrl,
    //   //             this.stepNo
    //   //           )
    //   //           .subscribe(async (lstContract) => {
    //   //             switch (this.signerInfo.supplier) {
    //   //               //usb
    //   //               case '5': {
    //   //                 if (lstContract) {
    //   //                   let finalContract = await this.signContractUSBToken(
    //   //                     lstContract,
    //   //                     0,
    //   //                     this.dialogSignFile.value.comment
    //   //                   );
    //   //                   if (finalContract) {
    //   //                     let result = {
    //   //                       result: true,
    //   //                       mode: mode,
    //   //                     };
    //   //                     this.notify.notifyCode('RS002');
    //   //                     this.canOpenSubPopup = false;
    //   //                     this.dialog && this.dialog.close(result);
    //   //                   } else {
    //   //                     this.canOpenSubPopup = false;
    //   //                     let result = {
    //   //                       result: false,
    //   //                       mode: mode,
    //   //                     };
    //   //                     this.notify.notifyCode('SYS021');
    //   //                     this.dialog && this.dialog.close(result);
    //   //                   }
    //   //                 }
    //   //                 break;
    //   //               }

    //   //               //vnpt || ky noi bo
    //   //               default: {
    //   //                 this.pdfView
    //   //                   .signPDF(mode, this.dialogSignFile.value.comment)
    //   //                   .then((value) => {
    //   //                     if (value) {
    //   //                       let result = {
    //   //                         result: true,
    //   //                         mode: mode,
    //   //                       };
    //   //                       this.notify.notifyCode('RS002');
    //   //                       this.canOpenSubPopup = false;
    //   //                       this.dialog && this.dialog.close(result);
    //   //                     } else {
    //   //                       this.canOpenSubPopup = false;
    //   //                       let result = {
    //   //                         result: false,
    //   //                         mode: mode,
    //   //                       };
    //   //                       this.notify.notifyCode('SYS021');
    //   //                       this.dialog && this.dialog.close(result);
    //   //                     }
    //   //                   });
    //   //               }
    //   //             }
    //   //           });
    //   //       }
    //   //     }
    //   //   }
    //   // });

    //   let dialogComment = this.callfc.openForm(
    //     PopupCommentComponent,
    //     title,
    //     500,
    //     500,
    //     this.funcID,
    //     {
    //       signfileID: this.sfRecID,
    //       title: title,
    //       formModel: this.formModel,
    //       formGroup: this.dialogSignFile,
    //       stepType: this.data.stepType,
    //       approveControl: this.oApprovalTrans?.approveControl,
    //       mode: this.mode,
    //     }
    //   );

    //   this.pdfView.curPage = this.pdfView.pageMax;
    //   dialogComment.closed.subscribe((res) => {
    //     if (res.event) {
    //       let result = res.event;
    //       this.dialogSignFile.patchValue({ comment: result.comment });
    //       switch (this.pdfView.signerInfo.signType) {
    //         //ky noi bo
    //         case '2': {
    //           if (this.pdfView.isAwait) {
    //             this.pdfView
    //               .signPDF(mode, this.dialogSignFile.value.comment)
    //               .then((value) => {
    //                 if (value) {
    //                   let result = {
    //                     result: true,
    //                     mode: mode,
    //                   };
    //                   this.notify.notifyCode('RS002');
    //                   this.canOpenSubPopup = false;
    //                   this.dialog && this.dialog.close(result);
    //                 } else {
    //                   this.canOpenSubPopup = false;
    //                   let result = {
    //                     result: false,
    //                     mode: mode,
    //                   };
    //                   this.notify.notifyCode('SYS021');
    //                   this.dialog && this.dialog.close(result);
    //                 }
    //               });
    //           }

    //           //         //khong doi
    //           //         else {
    //           //           switch (mode.toString()) {
    //           //             case '5': {
    //           //               this.esService
    //           //                 .updateTransAwaitingStatus(this.transRecID, false)
    //           //                 .subscribe((updateTransStatus) => {
    //           //                   if (updateTransStatus) {
    //           //                     let result = {
    //           //                       result: true,
    //           //                       mode: 9, //dang ky
    //           //                     };
    //           //                     this.pdfView
    //           //                       .signPDF(mode, this.dialogSignFile.value.comment)
    //           //                       .then((value) => {
    //           //                         if (value) {
    //           //                           let result = {
    //           //                             result: true,
    //           //                             mode: mode,
    //           //                           };
    //           //                           this.esService.setupChange.next(true);
    //           //                           this.esService.statusChange.next(mode);
    //           //                           this.notify.notifyCode('RS002');
    //           //                           this.canOpenSubPopup = false;
    //           //                         } else {
    //           //                           this.canOpenSubPopup = false;
    //           //                           this.esService
    //           //                             .updateTransAwaitingStatus(
    //           //                               this.transRecID,
    //           //                               true
    //           //                             )
    //           //                             .subscribe((updateTransStatus) => {
    //           //                               //that bai
    //           //                               this.esService.setupChange.next(true);
    //           //                               this.esService.statusChange.next(3);
    //           //                               this.notify.notifyCode('ES017');
    //           //                             });
    //           //                         }
    //           //                       });
    //           //                     this.canOpenSubPopup = false;
    //           //                     this.dialog && this.dialog.close(result);
    //           //                   } else {
    //           //                     this.canOpenSubPopup = false;
    //           //                     let result = {
    //           //                       result: false,
    //           //                       mode: mode,
    //           //                     };
    //           //                     this.notify.notifyCode('SYS021');
    //           //                     this.dialog && this.dialog.close(result);
    //           //                   }
    //           //                 });
    //           //               break;
    //           //             }
    //           //           }
    //           //         }
    //           //         break;
    //           //       }
    //           //       //ky cong khai
    //           //       case '1': {
    //           //         this.esService
    //           //           .getSignContracts(
    //           //             this.sfRecID,
    //           //             this.pdfView.curFileID,
    //           //             this.pdfView.curFileUrl,
    //           //             this.stepNo
    //           //           )
    //           //           .subscribe(async (lstContract) => {
    //           //             switch (this.signerInfo.supplier) {
    //           //               //usb
    //           //               case '5': {
    //           //                 if (lstContract) {
    //           //                   let finalContract = await this.signContractUSBToken(
    //           //                     lstContract,
    //           //                     0,
    //           //                     this.dialogSignFile.value.comment
    //           //                   );
    //           //                   if (finalContract) {
    //           //                     let result = {
    //           //                       result: true,
    //           //                       mode: mode,
    //           //                     };
    //           //                     this.notify.notifyCode('RS002');
    //           //                     this.canOpenSubPopup = false;
    //           //                     this.dialog && this.dialog.close(result);
    //           //                   } else {
    //           //                     this.canOpenSubPopup = false;
    //           //                     let result = {
    //           //                       result: false,
    //           //                       mode: mode,
    //           //                     };
    //           //                     this.notify.notifyCode('SYS021');
    //           //                     this.dialog && this.dialog.close(result);
    //           //                   }
    //           //                 }
    //           //                 break;
    //           //               }

    //           //               //vnpt || ky noi bo
    //           //               default: {
    //           //                 this.pdfView
    //           //                   .signPDF(mode, this.dialogSignFile.value.comment)
    //           //                   .then((value) => {
    //           //                     if (value) {
    //           //                       let result = {
    //           //                         result: true,
    //           //                         mode: mode,
    //           //                       };
    //           //                       this.notify.notifyCode('RS002');
    //           //                       this.canOpenSubPopup = false;
    //           //                       this.dialog && this.dialog.close(result);
    //           //                     } else {
    //           //                       this.canOpenSubPopup = false;
    //           //                       let result = {
    //           //                         result: false,
    //           //                         mode: mode,
    //           //                       };
    //           //                       this.notify.notifyCode('SYS021');
    //           //                       this.dialog && this.dialog.close(result);
    //           //                     }
    //           //                   });
    //           //               }
    //           //             }
    //           //           });
    //           //       }
    //           //     }
    //           //   }
    //           // });
    //           // this.pdfView.curPage = this.pdfView.pageMax;

    //           // dialogADR.closed.subscribe((res) => {
    //           //   if (res.event.toString()) {
    //           //     switch (this.pdfView.signerInfo.signType) {
    //           //       //ky noi bo
    //           //       case '2': {
    //           //         if (this.pdfView.isAwait) {
    //           //           this.pdfView
    //           //             .signPDF(mode, this.dialogSignFile.value.comment)
    //           //             .then((value) => {
    //           //               if (value) {
    //           //                 let result = {
    //           //                   result: true,
    //           //                   mode: mode,
    //           //                 };
    //           //                 this.notify.notifyCode('RS002');
    //           //                 this.canOpenSubPopup = false;
    //           //                 this.dialog && this.dialog.close(result);
    //           //               } else {
    //           //                 this.canOpenSubPopup = false;
    //           //                 let result = {
    //           //                   result: false,
    //           //                   mode: mode,
    //           //                 };
    //           //                 this.notify.notifyCode('SYS021');
    //           //                 this.dialog && this.dialog.close(result);
    //           //               }
    //           //             });

    //           //khong doi
    //           else {
    //             switch (mode.toString()) {
    //               case '5': {
    //                 this.esService
    //                   .updateTransAwaitingStatus(this.transRecID, false)
    //                   .subscribe((updateTransStatus) => {
    //                     if (updateTransStatus) {
    //                       let result = {
    //                         result: true,
    //                         mode: 9, //dang ky
    //                       };
    //                       this.pdfView
    //                         .signPDF(mode, this.dialogSignFile.value.comment)
    //                         .then((value) => {
    //                           if (value) {
    //                             let result = {
    //                               result: true,
    //                               mode: mode,
    //                             };
    //                             this.esService.setupChange.next(true);
    //                             this.esService.statusChange.next(mode);
    //                             this.notify.notifyCode('RS002');
    //                             this.canOpenSubPopup = false;
    //                           } else {
    //                             this.canOpenSubPopup = false;
    //                             this.esService
    //                               .updateTransAwaitingStatus(
    //                                 this.transRecID,
    //                                 true
    //                               )
    //                               .subscribe((updateTransStatus) => {
    //                                 //that bai
    //                                 this.esService.setupChange.next(true);
    //                                 this.esService.statusChange.next(3);
    //                                 this.notify.notifyCode('ES017');
    //                               });
    //                           }
    //                         });
    //                       this.canOpenSubPopup = false;
    //                       this.dialog && this.dialog.close(result);
    //                     } else {
    //                       this.canOpenSubPopup = false;
    //                       let result = {
    //                         result: false,
    //                         mode: mode,
    //                       };
    //                       this.notify.notifyCode('SYS021');
    //                       this.dialog && this.dialog.close(result);
    //                     }
    //                   });
    //                 break;
    //               }
    //             }
    //           }
    //           break;
    //         }
    //         //ky cong khai
    //         case '1': {
    //           this.esService
    //             .getSignContracts(
    //               this.sfRecID,
    //               this.pdfView.curFileID,
    //               this.pdfView.curFileUrl,
    //               this.stepNo
    //             )
    //             .subscribe(async (lstContract) => {
    //               switch (this.signerInfo.supplier) {
    //                 //usb
    //                 case '5': {
    //                   if (lstContract) {
    //                     let finalContract = await this.signContractUSBToken(
    //                       lstContract,
    //                       0,
    //                       this.dialogSignFile.value.comment
    //                     );
    //                     if (finalContract) {
    //                       let result = {
    //                         result: true,
    //                         mode: mode,
    //                       };
    //                       this.notify.notifyCode('RS002');
    //                       this.canOpenSubPopup = false;
    //                       this.dialog && this.dialog.close(result);
    //                     } else {
    //                       this.canOpenSubPopup = false;
    //                       let result = {
    //                         result: false,
    //                         mode: mode,
    //                       };
    //                       this.notify.notifyCode('SYS021');
    //                       this.dialog && this.dialog.close(result);
    //                     }
    //                   }
    //                   break;
    //                 }

    //                 //vnpt || ky noi bo
    //                 default: {
    //                   this.pdfView
    //                     .signPDF(mode, this.dialogSignFile.value.comment)
    //                     .then((value) => {
    //                       if (value) {
    //                         let result = {
    //                           result: true,
    //                           mode: mode,
    //                         };
    //                         this.notify.notifyCode('RS002');
    //                         this.canOpenSubPopup = false;
    //                         this.dialog && this.dialog.close(result);
    //                       } else {
    //                         this.canOpenSubPopup = false;
    //                         let result = {
    //                           result: false,
    //                           mode: mode,
    //                         };
    //                         this.notify.notifyCode('SYS021');
    //                         this.dialog && this.dialog.close(result);
    //                       }
    //                     });
    //                 }
    //               }
    //             });
    //         }
    //       }
    //     }
    //   });
    // } else {
    switch (this.pdfView.signerInfo.signType) {
      case '2': {
        if (this.pdfView.isAwait) {
          this.pdfView
            .signPDF(mode, this.dialogSignFile?.value?.comment)
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
        } else {
          this.esService
            .updateTransAwaitingStatus(this.transRecID, false)
            .subscribe((updateTransStatus) => {
              if (updateTransStatus) {
                let result = {
                  result: true,
                  mode: mode.toString() == '5' ? 9: mode, //dang ky
                };
                this.pdfView
                  .signPDF(mode, this.dialogSignFile.value.comment)
                  .then((value) => {
                    if (value) {
                      let result = {
                        result: true,
                        mode: mode,
                      };
                      this.esService.statusChange.next(mode);
                      this.esService.setupChange.next(true);
                      this.notify.notifyCode('RS002');
                      this.canOpenSubPopup = false;
                    } else {
                      this.esService.setupChange.next(true);
                      this.canOpenSubPopup = false;
                      let result = {
                        result: false,
                        mode: mode,
                      };
                      this.notify.notifyCode('SYS021');
                    }
                  });
                this.canOpenSubPopup = false;
                this.dialog && this.dialog.close(result);
              } else {
                this.canOpenSubPopup = false;
                let result = {
                  result: false,
                  mode: mode,
                };
                this.esService
                  .updateTransAwaitingStatus(this.transRecID, true)
                  .subscribe((updateTransStatus) => {
                    //that bai
                    this.esService.setupChange.next(true);
                    this.esService.statusChange.next(3);
                    this.notify.notifyCode('ES017');
                  });
                this.notify.notifyCode('SYS021');
                this.dialog && this.dialog.close(result);
              }
            });
        }

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
                  let finalContract = await this.signContractUSBToken(
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

          //vnpt || ky noi bo
          default: {
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
        }
        break;
      }
    }
  }

  async signContractUSBToken(lstContract, idx: number, comment) {
    //chua ki xong
    return new Promise<any>((resolve, rejects) => {
      this.http
        .post('http://localhost:6543/DigitalSignature/Sign', lstContract[idx])
        .subscribe((res: any) => {
          idx += 1;
          //ky xong
          if (idx == lstContract.length) {
            this.esService
              .saveUSBSignedPDF(
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
            lstContract = this.signContractUSBToken(lstContract, idx, comment);
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
