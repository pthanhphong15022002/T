import { I } from '@angular/cdk/keycodes';
import { ThisReceiver } from '@angular/compiler';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  CodxService,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { AddGridData, CodxEsService, ModelPage } from '../../../codx-es.service';
import { PopupSignatureComponent } from '../popup-signature/popup-signature.component';

@Component({
  selector: 'app-edit-signature',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditSignatureComponent implements OnInit {
  @Output() closeSidebar = new EventEmitter();
  @ViewChildren('attachment') attachment: AttachmentComponent;
  // @ViewChild('attachment', { static: false }) attachment: AttachmentComponent;
  // @ViewChild(AttachmentComponent) attachment: AttachmentComponent;
  @ViewChild('content') content;

  dataGrid: AddGridData;
  modelPage: ModelPage;
  dialogSignature: FormGroup;
  cbxName: any;
  isAfterRender: boolean = false;
  isAdd: boolean = true;
  currentTab = 1;
  type;
  objectIDFile: any;

  dataFile: any = null;
  Signature1: any = null;
  Signature2: any = null;
  Stamp: any = null;

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private notify: NotificationsService,
    private codxService: CodxService,
    private readonly auth: AuthService
  ) {}

  initForm() {
    this.esService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        console.log(item);

        this.dialogSignature = item;
        this.dialogSignature.patchValue({
          signatureType: '1',
          supplier: '1',
          oTPControl: '0',
          spanTime: 0,
          stop: false,
        });
        this.isAfterRender = true;
        this.isAdd = true;
        this.Signature1 = null;
        this.Signature2 = null;
        this.Stamp = null;
      });
  }

  ngOnInit(): void {
    this.esService.getModelPage('ESS21').then((res) => {
      if (res) {
        this.modelPage = res;

        this.esService
          .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
          .then((res) => {
            console.log(res);

            this.cbxName = res;
          });

        this.codxService
          .getAutoNumber(
            this.modelPage.functionID,
            this.modelPage.entity,
            'CategoryID'
          )
          .subscribe((dt: any) => {
            this.objectIDFile = dt;
          });

        this.initForm();
      }
    });
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

    this.api
      .callSv(
        'ES',
        'ERM.Business.ES',
        'SignaturesBusiness',
        'AddEditSignatureAsync',
        [this.dialogSignature.value, this.isAdd, '']
      )
      .subscribe((res) => {
        this.dataGrid = new AddGridData();
        if (res && res.msgBodyData[0][0] == true) {
          this.dataGrid.dataItem = res.msgBodyData[0][1];
          this.dataGrid.isAdd = this.isAdd;
          this.dataGrid.key = 'recID';
          this.notify.notify('Successfully');
          this.closeForm(this.dataGrid);
        } else {
          this.notify.notify('Fail');
          this.closeForm(null);
        }
      });
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
    // this.cfService
    //   .openForm(
    //     PopupSignatureComponent,
    //     'Thêm mới ghi chú',
    //     747,
    //     570,
    //     '',
    //     this.dialogSignature
    //   )
    //   .subscribe((dt: any) => {
    //     if (dt) {
    //       var that = this;
    //       dt.close = function (e) {};
    //     }
    //   });
    // this.cr.detectChanges();
  }

  nextStep() {
    this.currentTab += 1;
    this.cr.detectChanges();
  }

  previousStep() {
    if (this.currentTab > 0) {
      this.currentTab -= 1;
      this.cr.detectChanges();
    }
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

  close() {}

  popup(evt: any, type) {
    // this.attachment.openPopup();
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

  getLinkImg(data) {
    return `${environment.apiUrl}/api/dm/files/GetImage?id=${data[0]?.recID}&access_token=${this.auth.userValue.token}`;
  }
}
