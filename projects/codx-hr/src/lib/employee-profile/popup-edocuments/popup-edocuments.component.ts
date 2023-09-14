import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { createSolutionBuilderHost } from 'typescript';

@Component({
  selector: 'lib-popup-edocuments',
  templateUrl: './popup-edocuments.component.html',
  styleUrls: ['./popup-edocuments.component.css']
})
export class PopupEdocumentsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  disabledInput = false;
  disabledReturnedDate = false;
  disabledSubmittedDate = false;
  employId;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  originDocumentTypeID : any;
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
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.employId = data?.data?.employeeId;
    this.documentObj = JSON.parse(JSON.stringify(data?.data?.documentObj));
    console.log('data nhan vao', this.documentObj);
    if(this.documentObj){
      this.originDocumentTypeID = this.documentObj.documentTypeID;
    }
    
  }

    onInit(): void {
    if (!this.formGroup)
      this.hrService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrService
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName , this.formModel)
            .then((fg) => {
              if (fg) {
                this.formGroup = fg;
                this.initForm();
              }
            });
        }
      });
    else
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
        this.hrService.getHeaderText(this.funcID).then((res) => {
          this.fieldHeaderTexts = res;
        })
  }

  onChangeSwitch(evt, fieldName){
    let res 
    if(res == true){
      if(fieldName == 'isSubmitted'){
        this.documentObj.submittedDate = new Date();
        this.disabledSubmittedDate = false;
      }
      else if(fieldName == 'isReturned'){
        this.documentObj.returnedDate = new Date();
        this.disabledReturnedDate = false;
      }
      this.formGroup.patchValue(this.documentObj);
    }else{
      if(fieldName == 'isSubmitted'){
        this.documentObj.submittedDate = null;
        this.disabledSubmittedDate = true;
      }
      else if(fieldName == 'isReturned'){
        this.documentObj.returnedDate = null;
        this.disabledReturnedDate = true;
      }
      this.formGroup.patchValue(this.documentObj);
    }
  }

  onChangeDocumentType(event){
    this.GetDocumentByDocumentTypeID(event.data).subscribe((res) => {
      if(res){
        this.documentObj.submitWhen = res.submitWhen
        this.documentObj.isRequired = res.isRequired
        this.documentObj.hasReturn = res.hasReturn
        this.formGroup.patchValue(this.documentObj)
      }
    })
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.documentObj = res?.data;
            this.documentObj.employeeID = this.employId;

            this.formModel.currentData = this.documentObj;
            this.formGroup.patchValue(this.documentObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType === 'view') {
        this.formGroup.patchValue(this.documentObj);
        this.formModel.currentData = this.documentObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  async addFiles(evt){
    debugger
    this.changedInForm = true;
    this.documentObj.attachments = evt.data.length;
    this.formGroup.patchValue(this.documentObj);
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  async onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      this.form.validation(false)
      return;
    }
    debugger


    if(
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
      ) {
      this.attachment.objectId=this.documentObj?.recID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            debugger
          });
      }
      

    if (this.actionType === 'add' || this.actionType === 'copy') {
      // this.hrService.AddEmployeeVisaInfo(this.documentObj).subscribe((p) => {
      //   if (p != null) {
      //     this.documentObj.recID = p.recID;
      //     this.notify.notifyCode('SYS006');
      //     this.dialog && this.dialog.close(p);
      //   } else this.notify.notifyCode('SYS023');
      // });
    } else {
      if(this.originDocumentTypeID != this.documentObj.documentTypeID){
        this.UpdateEDocumentIdEdited(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } 
          // else this.notify.notifyCode('SYS021');
        });
      }
      else{
        this.UpdateEDocument(this.formModel.currentData)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS007');
              this.dialog && this.dialog.close(p);
            } 
            // else this.notify.notifyCode('SYS021');
          });
      }
    }
  }

  //#region APIs
  GetDocumentByDocumentTypeID(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness',
      'GetDocumentByDocumentTypeIDAsync',
      [data]
    );
  }

  AddEDocument(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness',
      'AddEDocumentsAsync',
      [this.documentObj]
    );
  }

  UpdateEDocument(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness',
      'UpdateEDocumentsAsync',
      data
    );
  }

  UpdateEDocumentIdEdited(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness',
      'UpdateEDocumentsIdEditedAsync',
      data
    );
  }

  DeleteEDocument(recId){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness',
      'DeleteEDocumentsAsync',
      recId
    );
  }
  //#endregion
}
