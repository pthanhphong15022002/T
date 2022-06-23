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
import {
  AddGridData,
  CodxEsService,
  ModelPage,
} from '../../../codx-es.service';
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
    this.data = data?.data;
    this.formModel = this.dialog.formModel;
    console.log(this.data);
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogSignature = item;
        this.dialogSignature.addControl(
          'recID',
          new FormControl(this.data.recID)
        );
        this.dialogSignature.addControl(
          '_uuid',
          new FormControl(this.data._uuid)
        );
        this.dialogSignature.patchValue({
          signatureType: '1',
          supplier: '1',
          oTPControl: '0',
          spanTime: 0,
          stop: false,
        });
        if (this.data != null) {
          this.dialogSignature.patchValue(this.data);
        }
        console.log(this.dialogSignature.value);

        this.isAfterRender = true;
        this.Signature1 = null;
        this.Signature2 = null;
        this.Stamp = null;
      });
  }

  ngOnInit(): void {
    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        console.log(res);

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
          console.log('Close without saving or save failed', res);
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }
  }

  onSavePopup() {
    if (this.content) {
      this.attachment.onMultiFileSave(null);
    }
  }

  onSaveForm() {
    if (this.dialogSignature.invalid == true) {
      return;
    }

    debugger;
    console.log(this.dialogSignature);
    this.data = this.dialogSignature.value;
    console.log(this.dialog.dataService.dataSelected);
    this.dialog.dataService.dataSelected = this.data;
    this.dialog.dataService.save().subscribe((res: any) => {
      if (res) {
        this.isSaveSuccess = true;
      }
      console.log(res);
    });

    // this.api
    //   .callSv(
    //     'ES',
    //     'ERM.Business.ES',
    //     'SignaturesBusiness',
    //     'AddEditSignatureAsync',
    //     [this.dialogSignature.value, this.isAdd, '']
    //   )
    //   .subscribe((res) => {
    //     this.dataGrid = new AddGridData();
    //     if (res && res.msgBodyData[0][0] == true) {
    //       this.dataGrid.dataItem = res.msgBodyData[0][1];
    //       this.dataGrid.isAdd = this.isAdd;
    //       this.dataGrid.key = 'recID';
    //       this.notification.notify('Successfully');
    //       this.closeForm(this.dataGrid);
    //     } else {
    //       this.notification.notify('Fail');
    //       this.closeForm(null);
    //     }
    //   });
  }

  valueChange(event: any) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogSignature.patchValue({ [event['field']]: event.data.value });
      else this.dialogSignature.patchValue({ [event['field']]: event.data });
    }
  }

  closeForm(data) {
    this.initForm();
    this.closeSidebar.emit(data);
  }

  openPopup(content) {
    this.cfService.openForm(
      PopupSignatureComponent,
      'Thêm mới ghi chú',
      800,
      600,
      '',
      this.dialogSignature
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
    return `${environment.apiUrl}/api/dm/files/GetImage?id=${data[0]?.recID}&access_token=${this.auth.userValue.token}`;
  }
}
