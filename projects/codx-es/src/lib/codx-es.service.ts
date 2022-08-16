import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  //#region  AutoNumbers
  public setupAutoNumber = new BehaviorSubject<any>(null);
  isSetupAutoNumber = this.setupAutoNumber.asObservable();

  getAutoNoCode(autoNo) {
    this.autoNoCode.next(autoNo);
  }

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
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalStepsBusiness',
      'GetListApprovalStepAsync',
      [model]
    );
  }

  addNewApprovalStep(lstData = null): Observable<any> {
    if (lstData == null) {
      this.approvalStep.subscribe((res) => {
        lstData = res;
      });
    }
    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'AddNewApprovalStepsAsync',
      [lstData]
    );
  }

  editApprovalStep(): Observable<any> {
    let lstDataEdit = null;
    this.approvalStep.subscribe((res) => {
      lstDataEdit = res;
    });

    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'UpdateApprovalStepsAsync',
      [lstDataEdit]
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

  deleteApprovalStep(): Observable<any> {
    let lstData = null;
    this.lstDelete.subscribe((res) => {
      lstData = res;
    });

    return this.api.execSv(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'DeleteListApprovalStepAsync',
      [lstData]
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

  getSFByID(data) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetByIDAsync',
      data
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

  //#endregion

  //#region ES_ApprovalTrans

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
  addOrEditSignArea(data: any): Observable<any> {
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

  getSignAreas(data): Observable<any> {
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

  updateSignFileTrans(data) {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'UpdateApprovalTransStatusAsync',
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
