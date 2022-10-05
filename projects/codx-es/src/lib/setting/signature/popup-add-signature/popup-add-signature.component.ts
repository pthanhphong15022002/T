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
import { FormControl, FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-charts';
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
  dialogSignature: FormGroup;
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

  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private cache: CacheService,
    private codxService: CodxService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dialog?.dataService?.dataSelected;
    this.isAdd = data?.data?.isAdd;
    this.formModel = this.dialog.formModel;
    this.headerText = data?.data?.headerText;
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      if (!this.isSaveSuccess) {
        this.dialog.closed.subscribe((res: any) => {
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }

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

  ngOnInit(): void {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogSignature = item;
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
          this.form?.formGroup.patchValue({ supplier: '1' });
        }
      } else if (event?.data === Object(event?.data))
        this.data[event['field']] = event?.data.value[0];
      else this.data[event['field']] = event?.data;
      this.cr.detectChanges();
    }
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    if (this.isAdd) {
      option.methodName = 'AddNewAsync';
    } else {
      option.methodName = 'EditAsync';
    }

    option.data = [itemData];
    return true;
  }

  onSaveForm() {
    this.dialogSignature.patchValue(this.data);

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
          if (
            this.imgSignature1.imageUpload ||
            this.imgSignature2.imageUpload ||
            this.imgStamp.imageUpload
          ) {
            this.imgSignature1.imageUpload &&
              this.imgSignature1
                .updateFileDirectReload(this.data.recID + '1')
                .subscribe((img) => {
                  if (img && this.data.signature1 == null) {
                    result.signature1 = (img[0] as any).recID;
                    this.data.signature1 = (img[0] as any).recID;
                    this.esService
                      .editSignature(this.data)
                      .subscribe((res) => {});
                  }
                  this.dialog && this.dialog.close(result);
                });
            this.imgSignature2.imageUpload &&
              this.imgSignature2
                .updateFileDirectReload(this.data.recID + '2')
                .subscribe((img) => {
                  this.dialog && this.dialog.close(result);

                  if (img && this.data.signature2 == null) {
                    result.signature2 = (img[0] as any).recID;

                    this.data.signature2 = (img[0] as any).recID;
                    this.esService
                      .editSignature(this.data)
                      .subscribe((res) => {});
                  }
                  this.dialog && this.dialog.close(result);
                });
            this.imgStamp.imageUpload &&
              this.imgStamp
                .updateFileDirectReload(this.data.recID + 's')
                .subscribe((img) => {
                  if (img && this.data.stamp == null) {
                    result.stamp = (img[0] as any).recID;

                    this.data.stamp = (img[0] as any).recID;
                    this.esService
                      .editSignature(this.data)
                      .subscribe((res) => {});
                  }
                  this.dialog && this.dialog.close(result);
                });
          } else {
            this.dialog && this.dialog.close(result);
          }
        }
      });
  }

  onSavePopup() {
    if (this.content) {
      this.attachment.onMultiFileSave();
    }
  }

  openPopup(content) {
    if (this.data.fullName == '' || this.data.fullName == null) {
      this.notification.notifyCode(
        'SYS028',
        0,
        '"' + this.grvSetup['FullName'].headerText + '"'
      );
      return;
    }
    let data = {
      dialog: this.dialog,
      model: this.dialogSignature,
      data: this.data,
    };
    this.cfService.openForm(PopupSignatureComponent, '', 800, 600, '', data);

    this.cr.detectChanges();
  }

  public lstDtDis: any;
  File: any;
  fileAdd: any;
  files: any;
  // fileAdded(event, currentTab) {
  //   switch (currentTab) {
  //     case 3:
  //       this.Signature1 = event.data;
  //       this.dialogSignature.patchValue({
  //         signature1: event.data[0].recID ?? null,
  //       });
  //       break;
  //     case 4:
  //       this.Signature2 = event.data;
  //       this.dialogSignature.patchValue({
  //         signature2: event.data[0].recID ?? null,
  //       });
  //       break;
  //     case 5:
  //       this.Stamp = event.data;
  //       this.dialogSignature.patchValue({ stamp: event.data[0].recID ?? null });
  //       break;
  //   }
  //   this.cr.detectChanges();
  // }

  getJSONString(data) {
    if (data) {
      switch (this.currentTab) {
        case 3:
          this.dialogSignature.patchValue({
            signature1: data[0]?.recID ?? null,
          });
          break;
        case 4:
          this.dialogSignature.patchValue({
            signature2: data[0]?.recID ?? null,
          });
          break;
        case 5:
          this.dialogSignature.patchValue({ stamp: data[0]?.recID ?? null });
          break;
      }
    }
    return JSON.stringify(data);
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

  popupUploadFile(evt: any) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa');

    this.attachment.uploadFile();
  }

  getfileCount(event) {}

  fileAdded(event) {}
}
