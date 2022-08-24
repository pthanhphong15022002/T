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
import {
  CallFuncService,
  CodxService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEsService } from '../../../codx-es.service';
import { PopupSignatureComponent } from '../popup-signature/popup-signature.component';

@Component({
  selector: 'popup-add-signature',
  templateUrl: './popup-add-signature.component.html',
  styleUrls: ['./popup-add-signature.component.scss'],
})
export class PopupAddSignatureComponent implements OnInit, AfterViewInit {
  @Output() closeSidebar = new EventEmitter();
  @ViewChildren('attachment') attachment: AttachmentComponent;
  @ViewChild('content') content;

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
  headerText = 'Thêm mới chữ ký số';
  subHeaderText = 'Tạo & upload file văn bản';

  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private codxService: CodxService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dialog?.dataService?.dataSelected;
    this.isAdd = data?.data?.isAdd;
    this.formModel = this.dialog.formModel;
    if (!this.isAdd) this.headerText = 'Chỉnh sửa chữ ký số';
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      if (!this.isSaveSuccess) {
        this.dialog.closed.subscribe((res: any) => {
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }
  }

  ngOnInit(): void {
    // this.esService
    //   .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
    //   .then((res) => {
    //     this.cbxName = res;
    //   });
    //this.initForm();
    // this.codxService
    //   .getAutoNumber(
    //     this.formModel.funcID,
    //     this.formModel.entityName,
    //     'CategoryID'
    //   )
    //   .subscribe((dt: any) => {
    //     this.objectIDFile = dt;
    //   });
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogSignature = item;
        this.dialogSignature.addControl('id', new FormControl(this.data?.id));
        this.dialogSignature.addControl(
          'recID',
          new FormControl(this.data?.recID)
        );
        this.dialogSignature.patchValue(this.data);

        if (!this.isAdd) {
          this.dialogSignature.patchValue({
            signatureType: '1',
            supplier: '1',
            oTPControl: '0',
            spanTime: 0,
            stop: false,
          });
        } else {
          this.dialogSignature.addControl(
            'recID',
            new FormControl(this.data?.recID)
          );
        }
        this.isAfterRender = true;
        this.Signature1 = null;
        this.Signature2 = null;
        this.Stamp = null;
      });
  }

  valueChange(event: any) {
    if (event?.field && event?.component) {
      if (event?.field == 'userID') {
        this.data[event['field']] = event?.data.value[0];
        this.data.fullName = event?.data.dataSelected[0].text;
        // this.dialogSignature.patchValue({
        //   [event['field']]: event?.data.value[0],
        // });
        // this.dialogSignature.patchValue({
        //   fullName: event?.data.dataSelected[0].text,
        // });
      } else if (event?.data === Object(event?.data))
        this.dialogSignature.patchValue({ [event['field']]: event.data.value });
      else this.dialogSignature.patchValue({ [event['field']]: event.data });
      this.cr.detectChanges();
    }
  }

  beforeSave(option: RequestOption) {
    //let itemData = this.dialogSignature.value;
    let itemData = this.data;
    if (this.isAdd) {
      option.methodName = 'AddNewAsync';
    } else {
      option.methodName = 'EditAsync';
    }

    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    // if (this.dialogSignature.invalid == true) {
    //   this.notification.notifyCode('E0016');
    //   return;
    // }

    //this.dialog.dataService.dataSelected = this.dialogSignature.value;
    this.dialog.dataService.dataSelected = this.data;
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.update || res.save) {
          this.isSaveSuccess = true;
          console.log(res);
          if (res.update) {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          this.dialog && this.dialog.close();
        }
      });
  }

  onSavePopup() {
    if (this.content) {
      this.attachment.onMultiFileSave();
    }
  }

  openPopup(content) {
    let data = {
      dialog: this.dialog,
      model: this.dialogSignature,
      data: this.data,
    };
    this.cfService.openForm(
      PopupSignatureComponent,
      'Thêm mới ghi chú',
      800,
      600,
      '',
      data
    );

    this.cr.detectChanges();
  }

  public lstDtDis: any;
  File: any;
  fileAdd: any;
  files: any;
  fileAdded(event, currentTab) {
    switch (currentTab) {
      case 3:
        this.Signature1 = event.data;
        this.dialogSignature.patchValue({
          signature1: event.data[0].recID ?? null,
        });
        break;
      case 4:
        this.Signature2 = event.data;
        this.dialogSignature.patchValue({
          signature2: event.data[0].recID ?? null,
        });
        break;
      case 5:
        this.Stamp = event.data;
        this.dialogSignature.patchValue({ stamp: event.data[0].recID ?? null });
        break;
    }
    this.cr.detectChanges();
  }

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

  getLinkImg(data) {
    // return `${environment.apiUrl}/api/dm/files/GetImage?id=${data[0]?.recID}&access_token=${this.auth.userValue.token}`;
  }
}
