import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
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
import { CodxEsService } from '../../codx-es.service';
import { PopupCommentComponent } from '../popup-comment/popup-comment.component';
import { ResponseModel } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { PdfComponent } from 'projects/codx-common/src/lib/component/pdf/pdf.component';
import { PopupSupplierComponent } from './popup-supplier/popup-supplier.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-popup-sign-for-approval',
  templateUrl: './popup-sign-for-approval.component.html',
  styleUrls: ['./popup-sign-for-approval.component.scss'],
})
export class PopupSignForApprovalComponent extends UIComponent {
  @ViewChild('pdfView') pdfView: PdfComponent;
  @ViewChild('popupOTPPin', { static: false }) popupOTPPin: TemplateRef<any>;
  @ViewChild('viettelCers', { static: false }) viettelCers: TemplateRef<any>;
  @ViewChild('viettelESignWait', { static: false }) viettelESignWait: TemplateRef<any>;

  isAfterRender: boolean = false;
  isConfirm = true;
  isApprover = true;
  otpControl: string = ''; //'1':SMS;2:Email;3:OTP
  stepNo: number;
  dialog: DialogRef;
  data;
  user;
  signerInfo: any = {};
  lstCert=[];
  formModel: FormModel;
  dialogSignFile: FormGroup;
  modeView="1";
  confirmValue: string = '';

  sfRecID = '';
  transRecID = null;
  oApprovalTrans: any = {};
  canOpenSubPopup;

  mode;
  title: string;
  subTitle: string;
  lstMF: any;

  isInteractPDF: boolean = false;
  isEdited: boolean;
  dialogOtpPin: any;
  isApproved: boolean;
  selectedCert: any;
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private notify: NotificationsService,
    private authStore: AuthStore,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private http: HttpClient,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt?.data;
    this.lstMF = dt?.data?.lstMF;    
    this.modeView = dt?.data?.modeView ?? "1";
    this.isApproved = dt?.data?.status =='5' ? true : false;
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
    this.esService.getByRecID(this.data?.oTrans?.transID).subscribe((res:any) => {
      if (res) {
        let sf = res;
        if (sf && sf?.files) {
          this.isEdited = sf?.files[0]?.isEdited;
        }
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
      this.esService
        .getMoreFunction(
          this.funcID,
          this.formModel.formName,
          this.formModel.gridViewName
        )
        .subscribe((res) => {});

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
              this.dialogOtpPin?.close(); 
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

  changeConfirmState(state) {
    if (this.oApprovalTrans.confirmControl == '1') {
      this.isConfirm = state?.data;
    }
  }

  checkConfirm(mode) {
    if (this.canOpenSubPopup && this.oApprovalTrans?.confirmControl == '1') {
      if (!this.isConfirm) this.notify.notifyCode('ES011');
    }
  }

  beforeOpenPopupADR(mf) {
    let morefuncID = mf.functionID;
    //sign mf = /Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204
    switch (morefuncID) {
      case 'SYS201':
      case 'SYS202':
      case 'SYS203': {
        //nhieu file
        if (this.pdfView?.lstFiles?.length > 1) {
          this.notify.alertCode('ES031').subscribe((x) => {
            if (x.event.status == 'Y') {
              this.clickOpenPopupADR(mf);
            } else {
              return;
            }
          });
        }
        //1 file
        else {
          this.clickOpenPopupADR(mf);
        }
        break;
      }
      default: {
        this.clickOpenPopupADR(mf);
        break;
      }
    }
  }
  imgAreaConfig = ['S1', 'S2', 'S3'];
  clickOpenPopupADR(mf) {
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206, Chỉnh sửa SYS208
    let morefuncID = mf.functionID;
    this.title = mf.text ?? '';

    if (!this.isConfirm) {
      this.notify.notifyCode('ES011');
      return;
    }
    if (!this.canOpenSubPopup) {
      return;
    }
    if (morefuncID != 'SYS206' && this.isInteractPDF) {
      return;
    }
    if (morefuncID != 'SYS206' && morefuncID != 'SYS208' && this.isEdited) {
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
      case 'SYS208': {
        //chỉnh sửa pdf
        let hasCA = this.pdfView.lstCA
          ? this.pdfView.lstCA.length != 0
            ? true
            : false
          : false;
        if (hasCA) {
          this.notify.alertCode('ES029').subscribe((x) => {
            if (x.event.status == 'Y') {
              this.isInteractPDF = !this.isInteractPDF;
              this.pdfView && this.pdfView.changeEditMode();
            }
            return;
          });
        } else {
          this.isInteractPDF = !this.isInteractPDF;
          this.pdfView && this.pdfView.changeEditMode();
        }
        return;
      }
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
    if (
      this.pdfView.areaControl &&
      (missingImgArea || this.pdfView.lstAreas.length == 0)
    ) {
      this.notify.alertCode('ES019').subscribe((x) => {
        if (x.event.status == 'Y') {
          let subTitle = 'Comment khi duyệt';
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
      let subTitle = 'Comment khi duyệt';
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
    if (this.otpControl == '1' || this.otpControl == '2') {
      this.esService
        .createOTPPin(this.oApprovalTrans.recID, this.otpControl)
        .subscribe();
    }
    this.dialogOtpPin = this.callfc.openForm(
      this.popupOTPPin,
      '',
      500,
      300,
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
        if (res?.event) {
          let oComment = res?.event;
          this.dialogSignFile.patchValue({ comment: oComment.comment });
          this.dialogSignFile.patchValue({ reasonID: oComment.reasonID });
          this.approve(mode, title, subTitle, null);
        } else {
          return;
        }
      });
    } else {
      this.approve(mode, title, subTitle, null);
    }
  }

  approve(mode, title: string, subTitle: string, comment: any) {
    comment = comment?.length>0 ? comment : this.dialogSignFile?.value?.comment;
    switch (this.pdfView.signerInfo.signType) {
      case '2': {
        // this.codxCommonService
        //   .codxApprove(this.transRecID, mode, null, comment, null, null, "1").subscribe((resModel: ResponseModel) => {
        //       if (resModel?.msgCodeError == null && resModel?.rowCount > 0) {
        //         this.notify.notifyCode('SYS034');
        //         this.canOpenSubPopup = false;
        //       } else {
        //         this.canOpenSubPopup = false;
        //         this.notify.notifyCode('SYS021');
        //       }
        //       this.dialog && this.dialog.close(resModel);
        //     });
        //if (!this.pdfView.isAwait) {
          this.pdfView
            .signPDF(mode, comment,null,"1")
            .then((resModel: ResponseModel) => {
              if (resModel?.msgCodeError == null && resModel?.rowCount > 0) {
                this.notify.notifyCode('SYS034');
                this.canOpenSubPopup = false;
              } else {
                this.canOpenSubPopup = false;
                this.notify.notifyCode('SYS021');
              }
              this.dialog && this.dialog.close(resModel);
            });
        // } else {
        //   this.esService
        //     .updateTransAwaitingStatus(this.transRecID, false)
        //     .subscribe((updateTransStatus) => {
        //       if (updateTransStatus) {
        //         // let result = {
        //         //   result: true,
        //         //   mode: mode.toString() == '5' ? 9 : mode, //dang ky
        //         // };
        //         this.pdfView
        //           .signPDF(mode, comment,null,"1")
        //           .then((resModel: ResponseModel) => {
        //             if (
        //               resModel?.msgCodeError == null &&
        //               resModel?.rowCount > 0
        //             ) {
        //               this.esService.statusChange.next(mode);
        //               this.esService.setupChange.next(true);
        //               this.notify.notifyCode('SYS034');
        //               this.canOpenSubPopup = false;
        //             } else {
        //               this.esService.setupChange.next(true);
        //               this.canOpenSubPopup = false;

        //               this.esService
        //                 .updateTransAwaitingStatus(this.transRecID, true)
        //                 .subscribe((updateTransStatus) => {
        //                   //that bai
        //                   this.esService.setupChange.next(true);
        //                   this.esService.statusChange.next(3);
        //                 });
        //               this.notify.notifyCode('SYS021');
        //             }
        //             this.dialog && this.dialog.close(resModel);
        //           });
        //         this.canOpenSubPopup = false;
        //       } else {
        //         this.canOpenSubPopup = false;
        //         let resModel = new ResponseModel();
        //         resModel.rowCount = 0; //ko thể cập nhật sang đang ký
        //         resModel.msgCodeError = 'ES017';
        //         this.esService
        //           .updateTransAwaitingStatus(this.transRecID, true)
        //           .subscribe((updateTransStatus) => {
        //             //that bai
        //             this.esService.setupChange.next(true);
        //             this.esService.statusChange.next(3);
        //             this.notify.notifyCode(resModel.msgCodeError);
        //           });
        //         this.dialog && this.dialog.close(resModel);
        //       }
        //     });
        // }

        break;
      }
      case '1': {
        let supplierDialog = this.callfc.openForm(PopupSupplierComponent,'',500,250,'');
        supplierDialog.closed.subscribe(res=>{
          if(res?.event){
            switch (res?.event) {
              //usb
              case '5': {
                let urlUpload = this.pdfView?.env.urlUpload+'/';
                let shortFileURL = this.pdfView?.curFileUrl?.replace(urlUpload,'');
                this.esService
                  .getSignContracts(
                    this.sfRecID,
                    this.pdfView.curFileID,
                    shortFileURL,
                    this.stepNo
                  )
                  .subscribe(async (lstContract) => {
                    if (lstContract) {
                      let finalContract = await this.signContractUSBToken(
                        lstContract,
                        0,
                        comment
                      );
                      if (finalContract) {
                        let resModel = new ResponseModel();
                        resModel.rowCount = 1;
                        resModel.returnStatus = '5';
                        this.notify.notifyCode('SYS034');
                        this.canOpenSubPopup = false;
                        this.dialog && this.dialog.close(resModel);
                      } else {
                        this.canOpenSubPopup = false;
                        let resModel = new ResponseModel();
                        resModel.rowCount = 0;
                        this.notify.notifyCode('SYS021');
                        this.dialog && this.dialog.close(resModel);
                      }
                    }
                  });
                break;
              }
              case '4'://Viettel
              {
                this.esService.getViettelCer(this.signerInfo.thirdPartyID).subscribe(cers=>{
                  if(cers){
                    this.lstCert = cers?.filter(x=>x?.error == null); 
                    if(this.lstCert?.length ==1){
                      this.viettelESign(mode,comment,this.lstCert[0]?.cert)
                    }
                    else if(this.lstCert?.length >1){
                      let dialogCers = this.callfc.openForm(this.viettelCers,'',450,300);  
                    }
                  }
                  else{
                    this.notify.notify("Không tìm thấy thông tin xác thực chữ ký số, vui lòng kiểm tra lại!",'2')
                  }
                    
                })
                break;
              }
              //vnpt 
              default: {
                this.pdfView.signPDF(mode, comment,null,"3").then((resModel: ResponseModel) => {
                  if (resModel?.msgCodeError == null && resModel?.rowCount > 0) {
                    this.notify.notifyCode('SYS034');
                    this.canOpenSubPopup = false;
                  } else {
                    this.canOpenSubPopup = false;
    
                    this.notify.notifyCode('SYS021');
                  }
                  this.dialog && this.dialog.close(resModel);
                });
                break;
              }
            }
          }
        });
        
        break;
      }
    }
  }
  viettelESign(data,comment,cert){
    let dialogCers = this.callfc.openForm(this.viettelESignWait,'',450,250);  
                    
    this.pdfView.signPDF(data,comment,JSON.stringify(cert),'4').then((resModel: ResponseModel) => {
      if (resModel?.msgCodeError == null && resModel?.rowCount > 0) {
        this.notify.notifyCode('SYS034');
        this.canOpenSubPopup = false;
        dialogCers && dialogCers.close();
      } else {
        this.canOpenSubPopup = false;

        this.notify.notifyCode('SYS021');
        dialogCers && dialogCers.close();
      }
      this.dialog && this.dialog.close(resModel);
    });
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

  changeActiveOpenPopup(e) {}

  changeSignerInfo(event) {
    if (event) {
      this.signerInfo = event;
    }
  }

  saveDialog() {
    this.dialog.close();
  }
  certChange(evt,cert) {    
    this.selectedCert = cert;
    this.detectorRef.detectChanges();
  }
  saveCert(dialog) {
    if(this.selectedCert==null) this.selectedCert = this.lstCert[0].cert;
    this.viettelESign("5",this.dialogSignFile?.value?.comment,this.selectedCert)
    dialog.close();
  }

  close(dialog: DialogRef = null) {
    if (dialog != null) {
      this.confirmValue = '';
      dialog && dialog.close();
    } else {
      this.dialog && this.dialog.close();
    }
  }

  eventHighlightText(event) {
    console.log('eventHighlightText', event);
    if (event) {
      switch (event.event) {
        case 'cancel': {
          this.isInteractPDF = event.isInteractPDF;
          break;
        }
        case 'save': {
          this.isEdited = event.isEdited;
          break;
        }
      }
    }
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {}
}
