import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Approvers } from '../../../codx-es.model';
import { CodxEsService } from '../../../codx-es.service';
import { PopupSignatureComponent } from '../popup-signature/popup-signature.component';

@Component({
  selector: 'popup-add-signature',
  templateUrl: './popup-add-signature.component.html',
  styleUrls: ['./popup-add-signature.component.scss'],
})
export class PopupAddSignatureComponent implements OnInit, AfterViewInit {
  @Output() closeSidebar = new EventEmitter();
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imgSignature1') imgSignature1: ImageViewerComponent;
  @ViewChild('imgSignature2') imgSignature2: ImageViewerComponent;
  @ViewChild('imgStamp') imgStamp: ImageViewerComponent;

  @ViewChild('content') content;
  @ViewChild('form') form: CodxFormComponent;

  isAdd = true;
  isSaveSuccess = false;
  cbxName: any;
  isAfterRender: boolean = false;
  currentTab = 1;
  type;
  objectIDFile: any;

  formModel: FormModel;

  dataFile: any = null;
  Signature1: any = null;
  Signature2: any = null;
  Stamp: any = null;
  dialog: any;
  data: any = null;
  headerText = '';
  subHeaderText = '';
  grvSetup: any = {};
  funcID = '';

  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private cache: CacheService,
    private router: ActivatedRoute,
    private codxService: CodxService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    console.log('data1', this.data.recID);
    //set gia trị data oTP != otp
    // this.data.oTPControl = this.data?.otpControl;
    // this.data.oTPPin = this.data?.otpPin;

    //delete otp
    // delete this.data?.otpControl;
    // delete this.data?.otpPin;

    this.isAdd = data?.data?.isAdd;
    this.type = data?.data?.type;
    this.formModel = this.dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = this.router.snapshot.params['funcID'];
  }

  ngAfterViewInit(): void {
    console.log('formGroup', this.form?.formGroup);
    console.log('data2', this.data.recID);

    if (this.dialog) {
      if (!this.isSaveSuccess) {
        this.dialog.closed.subscribe((res: any) => {
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }
  }

  ngOnInit(): void {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {});

    this.cache
      .gridViewSetup(
        this.form?.formModel?.formName,
        this.form?.formModel?.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
        }
      });
  }

  valueChange(event: any) {
    if (event?.field && event?.component) {
      if (event?.field == 'email') {
        let user = event?.data?.dataSelected[0]?.dataSelected;
        this.data.userID = user?.UserID;
        this.data.fullName = user?.UserName;
        this.data[event['field']] = event?.data.value[0];

        this.form?.formGroup.patchValue({
          fullName: this.data?.fullName,
          userID: this.data?.userID,
          email: this.data?.email,
        });

        let approver = new Approvers();
        approver.roleType = 'U';
        approver.approver = this.data.userID;
        this.esService.getDetailApprover(approver).subscribe((detail) => {
          if (detail?.length > 0) {
            this.data.position = detail[0]?.position;
            this.form?.formGroup?.patchValue({ position: this.data?.position });
          }
        });
      } else if (event?.field == 'signatureType') {
        if (event?.data == '2') {
          this.data.supplier = '1';
          this.form?.formGroup.patchValue({ supplier: this.data.supplier });
        } else if (event?.data == '1') {
          this.data.supplier = '3';
          this.form?.formGroup.patchValue({ supplier: this.data.supplier });
        }
      } else this.data[event['field']] = event?.data;
      this.cr.detectChanges();
    }
  }

  beforeSave(option: RequestOption) {
    //set gia trị data oTP != otp
    // this.data.otpControl = this.data.oTPControl;
    // this.data.otpPin = this.data.oTPPin;

    //delete oTP
    // delete this.data?.oTPControl;
    // delete this.data?.oTPPin;

    let itemData = this.data;
    if (this.isAdd) {
      option.methodName = 'AddNewAsync';
    } else {
      if (this.type == 'copy') {
        option.methodName = 'AddNewAsync';
      } else option.methodName = 'EditAsync';
    }

    option.data = [itemData];
    return true;
  }

  updateAfterUpload(i) {
    if (i <= 0) {
      this.esService.editSignature(this.data).subscribe((res) => {});
    }
  }

  onSaveForm() {
    if (this.form?.formGroup?.invalid == true) {
      this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
      return;
    }

    this.dialog.dataService.dataSelected = this.data;
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.update || res.save) {
          let result = res.save;

          this.isSaveSuccess = true;

          if (res.update) {
            result = res.update;
          }
          this.data = result;
          // if (
          //   this.imgSignature1.imageUpload?.item ||
          //   this.imgSignature2.imageUpload?.item ||
          //   this.imgStamp.imageUpload?.item
          // ) {
          //   var i = 0;
          //   if (this.imgSignature1.imageUpload?.item) i++;
          //   if (this.imgSignature2.imageUpload?.item) i++;
          //   if (this.imgStamp.imageUpload?.item) i++;

          //   this.imgSignature1.imageUpload?.item &&
          //     this.imgSignature1
          //       .updateFileDirectReload(this.data.recID)
          //       .subscribe((img) => {
          //         if (img) i--;
          //         else {
          //           this.notification.notifyCode(
          //             'DM006',
          //             0,
          //             this.imgSignature1.imageUpload?.fileName
          //           );
          //         }
          //         if (img && this.data.signature1 == null) {
          //           result.signature1 = (img[0] as any).recID;
          //           this.data.signature1 = (img[0] as any).recID;
          //           this.updateAfterUpload(i);
          //         }

          //         if (i <= 0) this.dialog && this.dialog.close(this.data);
          //       });
          //   this.imgSignature2.imageUpload?.item &&
          //     this.imgSignature2
          //       .updateFileDirectReload(this.data.recID)
          //       .subscribe((img) => {
          //         if (img) i--;
          //         else {
          //           this.notification.notifyCode(
          //             'DM006',
          //             0,
          //             this.imgSignature2.imageUpload?.fileName
          //           );
          //         }
          //         if (img && this.data.signature2 == null) {
          //           result.signature2 = (img[0] as any).recID;

          //           this.data.signature2 = (img[0] as any).recID;
          //           this.updateAfterUpload(i);
          //         }

          //         if (i <= 0) this.dialog && this.dialog.close(this.data);
          //       });
          //   this.imgStamp.imageUpload?.item &&
          //     this.imgStamp
          //       .updateFileDirectReload(this.data.recID)
          //       .subscribe((img) => {
          //         if (img) i--;
          //         else {
          //           this.notification.notifyCode(
          //             'DM006',
          //             0,
          //             this.imgStamp.imageUpload?.fileName
          //           );
          //         }
          //         if (img && this.data.stamp == null) {
          //           result.stamp = (img[0] as any).recID;

          //           this.data.stamp = (img[0] as any).recID;
          //           this.updateAfterUpload(i);
          //         }

          //         if (i <= 0) this.dialog && this.dialog.close(this.data);
          //       });
          // } else {
          this.dialog && this.dialog.close(result);
          // }
        }
      });
  }

  onSavePopup() {
    if (this.content) {
      this.attachment.onMultiFileSave();
    }
  }

  dataImageChanged(event: any, type: string) {
    console.log(event);

    switch (type) {
      case 'S1': {
        if (event?.status) {
          this.notification.notify(event?.message);
        } else {
          if (event && this.data.signature1 == null) {
            this.data.signature1 = (event[0] as any).recID;
          }
          this.data.signature1 = (event[0] as any).recID;
        }
        break;
      }
      case 'S2': {
        if (event?.status) {
          this.notification.notify(event?.message);
        } else {
          if (event && this.data.signature2 == null) {
            this.data.signature2 = (event[0] as any).recID;
          }
          this.data.signature2 = (event[0] as any).recID;
          break;
        }
        break;
      }
      case 'S3': {
        if (event?.status) {
          this.notification.notify(event?.message);
        } else {
          if (event && this.data.stamp == null) {
            this.data.stamp = (event[0] as any).recID;
          }
          this.data.stamp = (event[0] as any).recID;
          break;
        }
        break;
      }
    }
  }

  openPopup(content) {
    if (this.data.fullName == '' || this.data.fullName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['FullName'].headerText + '"'
      );
      return;
    }
    let data = {
      dialog: this.dialog,
      model: this.form?.formGroup,
      data: this.data,
    };
    this.cfService.openForm(PopupSignatureComponent, '', 800, 600, '', data);

    this.cr.detectChanges();
  }
  passwordChange(evt:any){
    if(evt){
      this.data.password= evt?.data;
      this.cr.detectChanges();
    }
  }
  public lstDtDis: any;
  File: any;
  fileAdd: any;
  files: any;

  changeTab(tab) {
    this.currentTab = tab;
  }

  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }

  getfileCount(event) {}

  fileAdded(event) {}
}
