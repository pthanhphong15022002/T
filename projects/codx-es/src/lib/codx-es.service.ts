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

  constructor(
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService
  ) {}

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

  getApprovalSteps(recID) {
    return this.api.execSv(
      'es',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetListApprovalStepAsync',
      recID
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

  addEditAutoNumbers(data: FormGroup, isAdd: boolean): Observable<any> {
    return this.api.exec<any>(
      'AD',
      'AutoNumbersBusiness',
      'SettingAutoNumberAsync',
      [data.value, isAdd]
    );

    // return this.api
    //   .call(
    //     'ERM.Business.AD',
    //     'AutoNumbersBusiness',
    //     'SettingAutoNumberAsync',
    //     [data.value, isAdd]
    //   )
    //   .pipe(
    //     map((data) => {
    //       if (data.error) return;
    //       return data.msgBodyData[0];
    //     }),
    //     catchError((err) => {
    //       return of(undefined);
    //     }),
    //     finalize(() => null)
    //   );
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
