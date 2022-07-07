import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { isBuffer } from 'util';
import { AddGridData, CodxEsService } from '../../../codx-es.service';
import { PopupSignatureComponent } from '../popup-signature/popup-signature.component';

@Component({
  selector: 'popup-add-signature',
  templateUrl: './popup-add-signature.component.html',
  styleUrls: ['./popup-add-signature.component.scss'],
})
export class PopupAddSignatureComponent implements OnInit, AfterViewInit {
  @Output() closeSidebar = new EventEmitter();
  @ViewChildren('attachment') attachment: AttachmentComponent;
  // @ViewChild('attachment', { static: false }) attachment: AttachmentComponent;
  // @ViewChild(AttachmentComponent) attachment: AttachmentComponent;
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
    private api: ApiHttpService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private codxService: CodxService,
    private readonly auth: AuthService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = data?.data[0];
    this.isAdd = data?.data[1];
    this.formModel = this.dialog.formModel;
    console.log(this.data);
    if (!this.isAdd) this.headerText = 'Chỉnh sửa chữ ký số';
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogSignature = item;
        this.dialogSignature.patchValue({
          signatureType: '1',
          supplier: '1',
          oTPControl: '0',
          spanTime: 0,
          stop: false,
        });
        if (!this.isAdd) {
          this.dialogSignature.patchValue(this.data);
          this.dialogSignature.addControl(
            'recID',
            new FormControl(this.data.recID)
          );
        }
        this.isAfterRender = true;
        this.Signature1 = null;
        this.Signature2 = null;
        this.Stamp = null;

        console.log(this.dialogSignature);
      });
  }

  ngOnInit(): void {
    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.cbxName = res;
      });

    this.initForm();

    this.codxService
      .getAutoNumber(
        this.formModel.funcID,
        this.formModel.entityName,
        'CategoryID'
      )
      .subscribe((dt: any) => {
        this.objectIDFile = dt;
      });
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

  beforeSave(option: any) {
    let itemData = this.dialogSignature.value;
    if (this.isAdd) {
      option.method = 'AddNewAsync';
    } else {
      option.method = 'EditAsync';
    }

    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.dialogSignature.invalid == true) {
      this.notification.notifyCode('E0016');
      return;
    }

    this.data = this.dialogSignature.value;

    this.dialog.dataService.dataSelected = this.data;
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  valueChange(event: any) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogSignature.patchValue({ [event['field']]: event.data.value });
      else this.dialogSignature.patchValue({ [event['field']]: event.data });
    }
  }

  onSavePopup() {
    if (this.content) {
      this.attachment.onMultiFileSave();
    }
  }

  closeForm(data) {
    this.initForm();
    this.closeSidebar.emit(data);
  }

  openPopup(content) {
    let data = {
      dialog: this.dialog,
      model: this.dialogSignature,
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
