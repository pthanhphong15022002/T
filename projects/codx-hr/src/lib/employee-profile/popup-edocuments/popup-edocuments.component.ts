import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-popup-edocuments',
  templateUrl: './popup-edocuments.component.html',
  styleUrls: ['./popup-edocuments.component.css'],
})
export class PopupEdocumentsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  disabledInput = false;
  disabledReturnedDate = false;
  disabledSubmittedDate = false;
  employId;
  // isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  originDocumentTypeID: any;
  headerText: any;
  changedInForm = false;
  actionType: any;
  documentObj: any;
  fieldHeaderTexts;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.employId = data?.data?.employeeId;
    this.formModel = dialog.formModel;
    this.documentObj = JSON.parse(JSON.stringify(data?.data?.documentObj));
    if (this.documentObj) {
      this.originDocumentTypeID = this.documentObj.documentTypeID;
    }
  }

  onInit(): void {
    this.initForm();
    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    });
  }

  dataChange(evt) {}

  onChangeSwitch(evt, fieldName) {
    let res = evt.data;
    if (res == true) {
      if (fieldName == 'isSubmitted') {
        this.documentObj.submittedDate = new Date();
        this.disabledSubmittedDate = false;
      } else if (fieldName == 'isReturned') {
        this.documentObj.returnedDate = new Date();
        this.disabledReturnedDate = false;
      }
      this.form.formGroup.patchValue(this.documentObj);
    } else {
      if (fieldName == 'isSubmitted') {
        this.documentObj.submittedDate = null;
        this.disabledSubmittedDate = true;
      } else if (fieldName == 'isReturned') {
        this.documentObj.returnedDate = null;
        this.disabledReturnedDate = true;
      }
      this.form.formGroup.patchValue(this.documentObj);
    }
  }

  onChangeDocumentType(event) {
    this.GetDocumentByDocumentTypeID(event.data).subscribe((res) => {
      if (res) {
        this.documentObj.submitWhen = res.submitWhen;
        this.documentObj.isRequired = res.isRequired;
        this.documentObj.hasReturn = res.hasReturn;
        this.form.formGroup.patchValue(this.documentObj);
      }
    });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.dialog.dataService?.addNew().subscribe((res: any) => {
        if (res) {
          this.documentObj = res;
          this.documentObj.employeeID = this.employId;
          this.cr.detectChanges();
        }
      });
    }
  }

  async addFiles(evt) {
    this.changedInForm = true;
    this.documentObj.attachments = evt.data.length;
    this.form.formGroup.patchValue(this.documentObj);
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  async onSaveForm() {
    if (
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
    ) {
      this.attachment.objectId = this.documentObj?.recID;
      (await this.attachment.saveFilesObservable()).subscribe();
    }
    this.form.save(null, 0, '', '', true).subscribe((res: any) => {
      if (res.save?.data || res.update?.data) {
        return this.dialog && this.dialog.close(res.save.data);
      }
      this.dialog && this.dialog.close();
    });
  }

  //#region APIs
  GetDocumentByDocumentTypeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'GetDocumentByDocumentTypeIDAsync',
      [data]
    );
  }

  AddEDocument() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'AddEDocumentsAsync',
      [this.documentObj]
    );
  }

  UpdateEDocument(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'UpdateEDocumentsAsync',
      data
    );
  }

  UpdateEDocumentIdEdited(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'UpdateEDocumentsIdEditedAsync',
      data
    );
  }

  DeleteEDocument(recId) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'DeleteEDocumentsAsync',
      recId
    );
  }
  //#endregion
}
