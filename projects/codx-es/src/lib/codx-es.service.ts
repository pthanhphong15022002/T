import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import {
  BehaviorSubject,
  Observable,
  map,
  catchError,
  finalize,
  of,
} from 'rxjs';
import { debug } from 'util';
import { ApprovalStepComponent } from './setting/approval-step/approval-step.component';

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
    private notificationsService: NotificationsService
  ) {}

  getAutoNoCode(autoNo) {
    this.autoNoCode.next(autoNo);
  }

  //#region Get from FunctionList
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
        }
        resolve(formModel);
      });
    });
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
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
              }
              if (element.fieldName == 'createdOn') {
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
              // if (element.isRequire) {
              //   modelValidator.push(Validators.required);
              // }
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

  //#endregion

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

  addSignFile(data, isAdd) {
    this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'AddEditAsync',
      [data, isAdd]
    );
  }

  getApprovalTrans(recID: string) {
    // let data = new DataRequest();
    // data.formName = 'ApprovalTrans';
    // data.gridViewName = 'grvSignFiles';
    // data.entityName = 'ES_ApprovalTrans';
    // data.predicate = 'ProcessID=@0';
    // data.dataValue = recID;
    // data.pageLoading = false;
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetByProcessIDAsync',
      recID
    );
  }

  //#region  AutoNumbers
  public setupAutoNumber = new BehaviorSubject<any>(null);
  isSetupAutoNumber = this.setupAutoNumber.asObservable();

  getAutoNumber(autoNoCode): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GetAutoNumberAsync',
      [autoNoCode]
    );
  }

  addEditAutoNumbers(data: FormGroup, isAdd: boolean): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'SettingAutoNumberAsync',
      [data.value, isAdd]
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
          console.log('1', stringFormat.length);

          stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
          console.log('2', stringFormat.length);
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

  //#region Category
  addNewCategory(data: any): Observable<any> {
    return this.api.execSv('ES', 'ES', 'CategoriesBusiness', 'AddNewAsync', [
      data,
      '',
      null,
    ]);
  }

  updateCategory(category: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ES',
      'CategoriesBusiness',
      'EditCategoryAsync',
      [category]
    );
  }

  deleteCategory(categoryID: string): Observable<any> {
    return this.api.execSv(
      'ES',
      'ES',
      'CategoriesBusiness',
      'DeleteCategoryAsync',
      [categoryID, '', null]
    );
  }
  //#endregion

  //#region ApprovalSteps
  private approvalStep = new BehaviorSubject<any>(null);
  isSetupApprovalStep = this.approvalStep.asObservable();

  private lstDelete = new BehaviorSubject<any>(null);
  private transID = new BehaviorSubject<any>(null);
  getTransID(transID) {
    this.transID.next(transID);
  }

  setApprovalStep(lstStep) {
    this.approvalStep.next(lstStep);
  }

  setLstDeleteStep(lstStep) {
    this.lstDelete.next(lstStep);
  }

  getApprovalStep() {
    this.approvalStep.subscribe((res) => {
      return res;
    });
  }

  getApprovalSteps(recID): Observable<any> {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetListApprovalStepAsync',
      recID
    );
  }

  addNewApprovalStep(lstApprovalStep: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'AddNewApprovalStepsAsync',
      [lstApprovalStep]
    );
  }

  editApprovalStep(lstApprovalStep: any): Observable<any> {
    let lstDataEdit = null;
    this.approvalStep.subscribe((res) => {
      lstDataEdit = res;
    });
    if (lstDataEdit != null)
      return this.api.execSv(
        'ES',
        'ES',
        'ApprovalStepsBusiness',
        'UpdateApprovalStepsAsync',
        [lstDataEdit]
      );
    else return null;
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

  deleteApprovalStep(lstApprovalStep: any): Observable<any> {
    let lstData = null;
    this.lstDelete.subscribe((res) => {
      lstData = res;
    });
    if (lstData != null) {
      return this.api.execSv(
        'ES',
        'ES',
        'ApprovalStepsBusiness',
        'DeleteListApprovalStepAsync',
        [lstData]
      );
    } else return null;
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
  //#endregion

  //#region EmailTemplate
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

  addOrEditSignArea(data: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignAreasBusiness',
      'AddOrEditAsync',
      data
    );
  }
  //#endregion
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
