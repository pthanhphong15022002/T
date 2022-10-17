import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { rejects } from 'assert';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DataRequest,
  FormModel,
  NotificationsService,
  UploadFile,
  UserModel,
} from 'codx-core';
import { AnyARecord } from 'dns';
import { resolve } from 'path';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Approvers, tmpBG_TrackLogs } from './codx-es.model';

export const UrlUpload: string = 'http://172.16.1.210:8011';
export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValue: string;
  predicate: string;
}
export class AddGridData {
  dataItem: any = null;
  isAdd: boolean = false;
  key: String = '';
}
export class Item {
  header: string;
  content: string;
  status: number;
  flag: number;
  datetime: string;
  avatar: string;
}

export class ES_SignFile {
  RecID: number;
  CategoryID: string;
  Title: string;
  Abstract: string;
  Tags: string;
  Priority: string;
  RefType: string;
  RefNo: string;
  RefDate: string;
  RefID: string;
  Copies: number;
  Pages: number;
  QRCode: string;
  ApproveStatus: string;
  ApproveSteps: string;
  Memo: string;
  Attachments: number;
  Comments: number;
  Moved: Boolean;
  PersonalFolder: string;
  // AutoCreated:	bit
  // ProcessID:	guid
  AutoCreated: Boolean;
  ProcessID: string;
  EmployeeID: string;
  OrgUnitID: string;
  DeptID: string;
  DivisionID: string;
  CompanyID: string;
  Permissions: {};
  Files: {};
  SignAreas: {};
  IsTemplate: Boolean;
  Owner: string;
  BUID: string;
  CreatedOn: string;
  CreatedBy: string;
  ModifiedOn: string;
  ModifiedBy: string;
}

export class tmpApprovalTrans {
  transID;
  approver;
  comment;
  mode; //Approve - 1 || Reject - 2 || Redo - 3
}
interface cbxObj {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CodxEsService {
  user: UserModel;
  layoutcpn = new BehaviorSubject<LayoutModel>(null);
  layoutChange = this.layoutcpn.asObservable();

  private autoNoCode = new BehaviorSubject<any>(null);

  constructor(
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {}

  notifyInvalid(formGroup: FormGroup, formModel: FormModel) {
    let gridViewSetup;
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);

    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          gridViewSetup = res;
          let headerText = gridViewSetup[fieldName]?.headerText ?? fieldName;

          if (fieldName == 'Email' && formGroup.value.email != null) {
            this.notificationsService.notifyCode(
              'E0003',
              0,
              '"' + headerText + '"'
            );
          } else {
            this.notificationsService.notifyCode(
              'SYS028',
              0,
              '"' + headerText + '"'
            );
          }
        }
      });
  }

  //#region Get from FunctionList
  getDataDefault(
    funcID: string,
    entityName: string,
    idField: string
  ): Observable<object> {
    return this.api.execSv('ES', 'CM', 'DataBusiness', 'GetDefaultAsync', [
      funcID,
      entityName,
      idField,
    ]);
  }

  setCacheFormModel(formModel: FormModel) {
    this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
      this.cache.setGridView(formModel.gridViewName, gridView);
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((gridViewSetup) => {
          this.cache.setGridViewSetup(
            formModel.formName,
            formModel.gridViewName,
            gridViewSetup
          );
        });
    });
  }

  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList?.entityName;
          formModel.formName = funcList?.formName;
          formModel.gridViewName = funcList?.gridViewName;
          formModel.funcID = funcList?.functionID;
          formModel.entityPer = funcList?.entityPer;

          this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
            this.cache.setGridView(formModel.gridViewName, gridView);
            this.cache
              .gridViewSetup(formModel.formName, formModel.gridViewName)
              .subscribe((gridViewSetup) => {
                this.cache.setGridViewSetup(
                  formModel.formName,
                  formModel.gridViewName,
                  gridViewSetup
                );
                resolve(formModel);
              });
          });
        }
      });
    });
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName =
                element.fieldName.charAt(0).toLowerCase() +
                element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == 'owner') {
                model[element.fieldName].push(user.userID);
              } else if (element.fieldName == 'bUID') {
                model[element.fieldName].push(user['buid']);
              } else if (element.fieldName == 'createdOn') {
                model[element.fieldName].push(new Date());
              } else if (element.fieldName == 'stop') {
                model[element.fieldName].push(false);
              } else if (element.fieldName == 'orgUnitID') {
                model[element.fieldName].push(user['buid']);
              } else if (
                element.dataType == 'Decimal' ||
                element.dataType == 'Int'
              ) {
                model[element.fieldName].push(0);
              } else if (
                element.dataType == 'Bool' ||
                element.dataType == 'Boolean'
              )
                model[element.fieldName].push(false);
              else if (element.fieldName == 'createdBy') {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }

              let modelValidator = [];
              if (element.isRequire) {
                modelValidator.push(Validators.required);
              }
              if (element.fieldName == 'email') {
                modelValidator.push(Validators.email);
              }
              if (modelValidator.length > 0) {
                model[element.fieldName].push(modelValidator);
              }

              // if (element.isRequire) {
              //   model[element.fieldName].push(
              //     Validators.compose([Validators.required])
              //   );
              // } else {
              //   model[element.fieldName].push(Validators.compose([]));
              // }
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          model['assign'].push(false);
          model['share'].push(false);
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getComboboxName(formName, gridView): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      var obj: { [key: string]: any } = {};
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        if (gv) {
          for (const key in gv) {
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              if (element.referedValue != null) {
                obj[key] = element.referedValue;
              }
            }
          }
        }
      });
      resolve(obj as object);
    });
  }

  getComboboxName1(formName, gridView) {
    var obj = {};
    this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
      if (gv) {
        for (const key in gv) {
          if (Object.prototype.hasOwnProperty.call(gv, key)) {
            const element = gv[key];
            if (element.referedValue != null) {
              obj[key] = element.referedValue;
            }
          }
        }
      }
    });

    return obj;
  }

  //#endregion

  //#region  EP
  execEP(
    className: string,
    methodName: string,
    data: any = null,
    uploadFiles: UploadFile[] = null
  ) {
    return this.api.exec<any>(className, methodName, data);
  }

  loadBookings(data) {
    return this.execEP('GetEventsAsync', data);
  }
  loadResources(data) {
    return this.execEP('GetListAsync', data);
  }
  loadResources4Booking(data) {
    return this.execEP('GetResourceAsync', data);
  }

  loadSignFiles() {
    let data = new DataRequest();
    data.formName = 'SignFiles';
    data.gridViewName = 'grvSignFiles';
    data.entityName = 'ES_SignFiles';
    data.pageLoading = false;
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetAsync',
      data
    );
  }

  getTotalGByApproveStatus() {
    let data = new DataRequest();
    data.formName = 'SignFiles';
    data.gridViewName = 'grvSignFiles';
    data.entityName = 'ES_SignFiles';
    data.pageLoading = false;
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetTotalGByApproveStatusAsync',
      data
    );
  }

  getTotalGByCategory() {
    let data = new DataRequest();
    data.formName = 'SignFiles';
    data.gridViewName = 'grvSignFiles';
    data.entityName = 'ES_SignFiles';
    data.pageLoading = false;
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetTotalGByCategoryAsync',
      data
    );
  }

  getDocsGByDays() {
    let model = new DataRequest();
    model.formName = 'SignFiles';
    model.gridViewName = 'grvSignFiles';
    model.entityName = 'ES_SignFiles';
    model.pageLoading = false;
    let month = (new Date().getMonth() + 1).toString();

    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetDocsGByDayAsync',
      [model, month]
    );
  }

  getApprovedSignatures(recID, userID) {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetApprovedSignTransAsync',
      [recID, userID]
    );
  }
  //#endregion

  //#region AD_AutoNumbers

  public setupChange = new BehaviorSubject<any>(null);
  isSetupChange = this.setupChange.asObservable();

  getAutoNumber(autoNoCode): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GetAutoNumberAsync',
      [autoNoCode]
    );
  }

  addEditAutoNumbers(data: any, isAdd: boolean): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'SettingAutoNumberAsync',
      [data, isAdd]
    );
  }

  deleteAutoNumber(autoNoCode: string): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'DeleteAutoNumberAsync',
      [autoNoCode]
    );
  }

  updateAutoNoCode(newNo: string): Observable<any> {
    let oldNo = null;
    this.autoNoCode.subscribe((res) => {
      oldNo = res;
    });

    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'UpdateAutoNoCodeAsync',
      [oldNo, newNo]
    );
  }

  setViewAutoNumber(modelAutoNumber) {
    let vllDateFormat;
    let vllStringFormat;
    this.cache.valueList('L0088').subscribe((vllDFormat) => {
      vllDateFormat = vllDFormat.datas;
      this.cache.valueList('L0089').subscribe((vllSFormat) => {
        vllStringFormat = vllSFormat.datas;
        let indexStrF = vllStringFormat.findIndex(
          (p) => p.value == modelAutoNumber.stringFormat.toString()
        );
        let indexDF = vllDateFormat.findIndex(
          (p) => p.value == modelAutoNumber.dateFormat?.toString()
        );
        let stringFormat = '';
        let dateFormat = '';
        if (indexStrF >= -1) {
          stringFormat = vllStringFormat[indexStrF].text;

          stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
        }

        // replace chuỗi và dấu phân cách
        stringFormat = stringFormat
          .replace(
            'Chuỗi',
            modelAutoNumber.fixedString == null
              ? ''
              : modelAutoNumber.fixedString
          )
          .replace(
            /-/g,
            modelAutoNumber.separator == null ? '' : modelAutoNumber.separator
          );

        //replace ngày
        if (indexDF >= 0) {
          dateFormat =
            vllDateFormat[indexDF].text == 'None'
              ? ''
              : vllDateFormat[indexDF].text;
        }
        stringFormat = stringFormat.replace('Ngày', dateFormat);

        //replace số và set chiều dài
        let lengthNumber = modelAutoNumber.maxLength - stringFormat.length + 2;
        if (lengthNumber < 0) {
          stringFormat = stringFormat.replace('Số', '');
          stringFormat = stringFormat.substring(0, modelAutoNumber.maxLength);
        } else if (lengthNumber == 0) {
          stringFormat = stringFormat.replace('Số', '');
        } else {
          let strNumber = '#'.repeat(lengthNumber);
          stringFormat = stringFormat.replace('Số', strNumber);
        }
        return stringFormat;
      });
    });
  }

  //#endregion

  //#region ES_Signatures

  getDataSignature(userID: string, signatureType: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ES',
      'SignaturesBusiness',
      'GetByUserIDAsync',
      [userID, signatureType]
    );
  }

  addNewSignature(data: any) {
    return this.api.execSv('ES', 'ES', 'SignaturesBusiness', 'AddNewAsync', [
      data,
    ]);
  }

  editSignature(data: any) {
    return this.api.execSv('ES', 'ES', 'SignaturesBusiness', 'EditAsync', [
      data,
    ]);
  }

  //#endregion

  //#region ES_Category
  addNewCategory(data: any) {
    return this.api.execSv('ES', 'ES', 'CategoriesBusiness', 'AddNewAsync', [
      data,
      '',
      null,
    ]);
  }

  updateCategory(category: any) {
    return this.api.execSv(
      'ES',
      'ES',
      'CategoriesBusiness',
      'EditCategoryAsync',
      [category]
    );
  }

  deleteCategory(categoryID: string) {
    return this.api.execSv(
      'ES',
      'ES',
      'CategoriesBusiness',
      'DeleteCategoryAsync',
      [categoryID, '', null]
    );
  }

  getCategoryByCateID(categoryID: string) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'CategoriesBusiness',
      'GetByCategoryIDAsync',
      [categoryID]
    );
  }
  //#endregion

  //#region ES_ApprovalSteps
  public approvalStep = new BehaviorSubject<any>(null);
  isSetupApprovalStep = this.approvalStep.asObservable();

  public lstDelete = new BehaviorSubject<any>(null);
  private transID = new BehaviorSubject<any>(null);
  getTransID(transID) {
    this.transID.next(transID);
  }

  setApprovalStep(lstStep) {
    this.approvalStep.next(lstStep);
    console.log('setdataStep', lstStep);
  }

  setLstDeleteStep(lstStep) {
    this.lstDelete.next(lstStep);
    console.log('setdata delete Step', lstStep);
  }

  getApprovalStep() {
    this.approvalStep.subscribe((res) => {
      return res;
    });
  }

  getApprovalSteps(model: GridModels): Observable<any> {
    if (model.dataValue && (model.dataValue != '' || model.dataValue != null)) {
      return this.api.execSv(
        'es',
        'ERM.Business.ES',
        'ApprovalStepsBusiness',
        'GetListApprovalStepAsync',
        [model]
      );
    } else return EMPTY;
  }

  addNewApprovalStep(lstData = null): Observable<any> {
    if (lstData == null) {
      this.approvalStep.subscribe((res) => {
        lstData = res;
      });
    }
    if (lstData == null) {
      return EMPTY;
    } else {
      return this.api.execSv(
        'ES',
        'ES',
        'ApprovalStepsBusiness',
        'AddNewApprovalStepsAsync',
        [lstData]
      );
    }
  }

  editApprovalStep(lstEdit: any = null): Observable<any> {
    let lstDataEdit = lstEdit;

    if (lstDataEdit == null) {
      this.approvalStep.subscribe((res) => {
        lstDataEdit = res;
      });
    }
    if (lstDataEdit == null) return EMPTY;
    else {
      return this.api.execSv(
        'ES',
        'ES',
        'ApprovalStepsBusiness',
        'UpdateApprovalStepsAsync',
        [lstDataEdit]
      );
    }
  }

  deleteApprovalStep(lstDelete: any = null): Observable<any> {
    let lstData = lstDelete;
    if (lstData == null) {
      this.lstDelete.subscribe((res) => {
        lstData = res;
      });
    }
    if (lstData == null) {
      return EMPTY;
    } else {
      return this.api.execSv(
        'ES',
        'ES',
        'ApprovalStepsBusiness',
        'DeleteListApprovalStepAsync',
        [lstData]
      );
    }
  }

  deleteStepByTransID(transID: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'DeleteByTransIDAsync',
      [transID]
    );
  }

  updateTransID(newTransID): Observable<any> {
    let oldTransID = '00000000-0000-0000-0000-000000000000';
    this.transID.subscribe((res) => {
      oldTransID = res;
    });
    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'UpdateCategoryIDAsync',
      [oldTransID, newTransID]
    );
  }

  getNewDefaultEmail() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetEmailDefaultAsync',
      []
    );
  }

  getDetailApprover(approver: Approvers): Observable<Approvers[]> {
    let lstAprrover = [approver];

    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'HRBusiness',
      'GetInfoApproverAsync',
      [lstAprrover]
    );
  }

  //#endregion

  //#region EmailTemplate
  public lstTmpEmail = [];
  deleteEmailTemplate(): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'DeleteEmailTemplateAsync',
      [this.lstTmpEmail]
    );
  }

  getEmailTemplate(templateID: string): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetEmailTemplateAsync',
      templateID
    );
  }

  addEmailTemplate(data: any, sendTo: any): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'AddEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  editEmailTemplate(data: any, sendTo: any): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'EditEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  saveHistorySendEmail(tmpHistory: tmpBG_TrackLogs): Observable<any> {
    return this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'TrackLogsBusiness',
      'InsertAsync',
      tmpHistory
    );
  }

  sendEmailTemplate(emailRecID) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'SendEmailAsync',
      emailRecID
    );
  }
  //#endregion

  //#region ES_SignFiles
  getAutoNumberByCategory(categoryID): Observable<any> {
    return this.api.exec(
      'ERM.Business.AD',
      'AutoNumbersBusiness',
      'CreateAutoNumberAsync',
      [categoryID, null, true, null]
    );
  }

  getDetailSignFile(recID): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetDetailAsync',
      recID
    );
  }

  getSFByUserID(data) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetSignFilesByUserIDAsync',
      data
    );
  }

  getSFByID(data): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetByIDAsync',
      data
    );
  }

  getListCA(signfileID, fileID) {
    let data = [signfileID, fileID];
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetCAInPDFAsync',
      data
    );
  }

  getListCAByBytes(fileUrl) {
    let data = [fileUrl];
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetCAInPDFByBytesAsync',
      data
    );
  }

  getListSFByID(lstID: string[]): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetLstSignFileByIDAsync',
      JSON.stringify(lstID)
    );
  }

  getSignFormat() {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetSignFormatAsync'
    );
  }

  addNewSignFile(data: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'AddNewSignFileAsync',
      [data]
    );
  }

  editSignFile(data: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'EditSignFileAsync',
      [data]
    );
  }

  deleteSignFile(recID: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'DeleteSignFileAsync',
      [recID]
    );
  }

  saveSignFileIsTemplate(recID: string, templateName: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'CreateTemplateBySignFileAsync',
      [recID, templateName]
    );
  }

  updateApproveTemplate(sfID: string, processID: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'UpdateTemplateSignFileAsync',
      [sfID, processID]
    );
  }

  addImgsToPDF(pages, lstAddBefore) {
    let data = [pages, lstAddBefore];
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'AddImgToPDFAsync',
      data
    );
  }
  //#endregion

  //#region ES_ApprovalTrans

  getTask(recID: string): Observable<any> {
    return this.api.execSv(
      'TM',
      'ERM.Business.TM',
      'TaskBusiness',
      'GetListTaskTreeByRefIDAsync',
      recID
    );
  }

  addQRBeforeRelease(sfRecID: string) {
    return this.api.execSv<any>(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'AddQRBeforeReleaseAsync',
      [sfRecID]
    );
  }

  release(oSignFile: any, entityName: string, funcID: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.CM',
      'DataBusiness',
      'ReleaseAsync',
      [
        oSignFile?.recID,
        oSignFile.approveControl == '1'
          ? oSignFile?.recID
          : oSignFile?.processID,
        entityName,
        funcID,
        '<div>' + oSignFile.title + '</div>',
      ]
    );
  }

  getApprovalTrans(recID: string) {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetViewByTransIDAsync',
      [recID]
    );
  }

  //#endregion

  addOrEditSignArea(recID, fileID, area, areaID): Observable<any> {
    let data = [recID, fileID, area, areaID];
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'AddOrEditAreaAsync',
      data
    );
  }

  deleteAreaById(data: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'DeleteAreaAsync',
      data
    );
  }

  getSignAreas(sfID, fileID, isApprover, userID): Observable<any> {
    let data = [sfID, fileID, isApprover, userID];
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetAllAreasAsync',
      data
    );
  }

  getLastTextLine(pageNumber: number): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post<any>(
      environment.pdfUrl + '/TextOnPage',
      {
        action: 'TextOnPage',
        pageIndex: pageNumber - 1,
      },
      httpOptions
    );
  }

  renderQRFile(
    docId,
    eleId,
    freeTextAnnotation,
    hashId,
    inkSignatureData,
    measureShapeAnnotations,
    shapeAnnotations,
    signatureData,
    stampAnnotations,
    stickyNotesAnnotation,
    textMarkupAnnotations,
    uniqueId
  ): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post<any>(
      environment.pdfUrl + '/RenderQRFile',
      {
        action: 'Download',
        documentId: docId,
        elementId: eleId,
        fieldsData: undefined,
        freeTextAnnotation: freeTextAnnotation,
        hashId: hashId,
        inkSignatureData: inkSignatureData,
        measureShapeAnnotations: measureShapeAnnotations,
        shapeAnnotations: shapeAnnotations,
        signatureData: signatureData,
        stampAnnotations: stampAnnotations,
        stickyNotesAnnotation: stickyNotesAnnotation,
        textMarkupAnnotations: textMarkupAnnotations,
        uniqueId: uniqueId,
      },
      httpOptions
    );
  }

  toPDF(data) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'ToPDFAsync',
      data
    );
  }

  addQRToPdf(content) {
    let data = [content];
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GenerateQRCodeAsync',
      data
    );
  }

  updateSignFileTrans(stepNo, isAwait, userID, sfID, mode, comment) {
    let data = [stepNo, isAwait, userID, sfID, mode, comment];
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'UpdateApprovalTransStatusAsync',
      data
    );
  }

  approveAsync(transID, status, reasonID, comment) {
    let data = [transID, status, reasonID, comment];
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      data
    );
  }
  //#endregion

  //#region CA
  createLocalCertificatePFX(mail, pass) {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'SignaturesBusiness',
      'CreateLocalCertificatePFXAsync',
      [mail, pass]
    );
  }
  //#endregion
  getPDFBase64(fileID): Observable<any> {
    let data = [fileID];
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetPDFFileBase64Async',
      data
    );
  }

  //#region File
  getFiles(funcID: string, objectId: string, objectType): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesForOutsideAsync',
      [funcID, objectId, objectType]
    );
  }

  getLstFileByID(lstID: string[]): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetListFileByIDAsync',
      [JSON.stringify(lstID)]
    );
  }
  //#endregion

  getEmployee(userID: string): Observable<any> {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetEmpUsers',
      userID
    );
  }

  loadDataCbx(
    service: string,
    dataRequest: DataRequest = null
  ): Observable<any> {
    if (dataRequest == null) {
      dataRequest = new DataRequest();
      dataRequest.comboboxName = 'DataViewItems';
      dataRequest.page = 1;
      dataRequest.pageSize = 10;
    }
    return this.api.execSv(
      service,
      'ERM.Business.CM',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
  }

  getSettingByPredicate(predicate, dataValue) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByPredicate',
      [predicate, dataValue]
    );
  }
}
export class LayoutModel {
  isChange: boolean = false;
  title: string = '';
  asideDisplay: boolean = true;
  toolbarDisplay: boolean = true;
  constructor(isChange, title, asideDisplay, toolbarDisplay) {
    this.isChange = isChange;
    this.title = title;
    this.asideDisplay = asideDisplay;
    this.toolbarDisplay = toolbarDisplay;
  }
}
