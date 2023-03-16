import { BehaviorSubject, finalize, map, Observable, of, share } from 'rxjs';
import { Injectable } from '@angular/core';
import { TM_Tasks } from './components/codx-tasks/model/task.model';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PopupCommentComponent } from 'projects/codx-es/src/lib/sign-file/popup-comment/popup-comment.component';
import { environment } from 'src/environments/environment';
import { AssignTaskModel } from './models/assign-task.model';



@Injectable({
  providedIn: 'root',
})
export class CodxShareService {
  hideAside = new BehaviorSubject<any>(null);
  dataRefreshImage = new BehaviorSubject<any>(null);
  dataUpdateShowEvent = new BehaviorSubject<any>(null);
  dateChange = new BehaviorSubject<any>(null);
  dataResourceModel = new BehaviorSubject<any>(null);
  settingValue = new BehaviorSubject<any>(null);
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  constructor(
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder
  ) {}
  loadFuncID(functionID: any): Observable<any> {
    let paras = [functionID];
    let keyRoot = 'MFunc' + functionID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.api
      .execSv('SYS', 'SYS', 'MoreFunctionsBusiness', 'GetAsync', functionID)
      .pipe(
        map((res) => {
          if (res) {
            let c = this.caches.get(keyRoot);
            c?.set(key, res);
            return res;
          }
          return null;
        }),
        share(),
        finalize(() => this.cachedObservables.delete(key))
      );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  defaultMoreFunc(
    val: any,
    data: any,
    afterSave?: Function,
    formModel?: any,
    dataService?: any,
    that: any = null
  ) {
    var funcID = val?.functionID;
    switch (funcID) {
      //Giao việc
      case 'ODT1013': {
        var task = new TM_Tasks();
        task.refID = data?.recID;
        task.refType = formModel.entityName;

        let option = new SidebarModel();
        let assignModel: AssignTaskModel = {
          vllRole: 'TM002',
          title: val?.data.customName,
          vllShare: 'TM003',
          task: task,
          referedData: data,
          referedFunction: val.data,
        };
        option.DataService = dataService;
        option.FormModel = formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          AssignInfoComponent,
          assignModel,
          option
        );
        dialog.closed.subscribe((e) => {
          if (afterSave && e?.event && e?.event[0]) {
            var result = {
              funcID: funcID,
              result: e?.event,
              data: data,
            };
            afterSave(result, that);
          }
        });
        break;
      }
    }
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

  getESDataDefault(funcID: string, entityName: string, idField: string) {
    return this.api.execSv<any>(
      'ES',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, idField]
    );
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
              'SYS009',
              0,
              '"' + headerText + '"'
            );
          }
        }
      });
  }

  getDetailApprover(approver: Approvers) {
    let lstAprrover = [approver];

    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'HRBusiness',
      'GetInfoApproverAsync',
      [lstAprrover]
    );
  }

  //#region EmailTemplate
  loadDataCbx(service: string, dataRequest: DataRequest = null) {
    if (dataRequest == null) {
      dataRequest = new DataRequest();
      dataRequest.comboboxName = 'DataViewItems';
      dataRequest.page = 1;
      dataRequest.pageSize = 10;
    }
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
  }

  loadData(service: string, dataRequest: DataRequest = null) {
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataAsync',
      [dataRequest]
    );
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        if (gv) {
          var arrgv = Object.values(gv) as any[];
          const group: any = {};
          arrgv.forEach((element) => {
            var keytmp = Util.camelize(element.fieldName);
            var value = null;
            var type = element.dataType.toLowerCase();
            if (type === 'bool') value = false;
            if (type === 'datetime') value = new Date();
            if (type === 'int' || type === 'decimal') value = 0;
            group[keytmp] = element.isRequire
              ? new FormControl(value, Validators.required)
              : new FormControl(value);
          });
          group['updateColumn'] = new FormControl('');
          var formGroup = new FormGroup(group);
          resolve(formGroup);
        }
      });
      // this.cache
      //   .gridViewSetup(formName, gridView)
      //   .subscribe((grvSetup: any) => {
      //     let gv = Util.camelizekeyObj(grvSetup);
      //     var model = {};
      //     model['write'] = [];
      //     model['delete'] = [];
      //     model['assign'] = [];
      //     model['share'] = [];
      //     if (gv) {
      //       const user = this.auth.get();
      //       for (const key in gv) {
      //         const element = gv[key];
      //         element.fieldName = Util.camelize(element.fieldName);
      //         model[element.fieldName] = [];
      //         let modelValidator = [];
      //         if (element.isRequire) {
      //           modelValidator.push(Validators.required);
      //         }
      //         if (element.fieldName == 'email') {
      //           modelValidator.push(Validators.email);
      //         }
      //         if (modelValidator.length > 0) {
      //           model[element.fieldName].push(modelValidator);
      //         }
      //       }
      //       model['write'].push(false);
      //       model['delete'].push(false);
      //       model['assign'].push(false);
      //       model['share'].push(false);
      //     }

      //   });
    });
  }

  getEmailTemplate(templateID: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetViewEmailTemplateAsync',
      [templateID]
    );
  }

  sendEmailTemplate(emailRecID) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'SendEmailAsync',
      [emailRecID]
    );
  }

  getDataDefault() {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetDataDefaultAsync'
    );
  }

  addEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'AddEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  editEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'EditEmaiTemplateAsync',
      [data, sendTo]
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

  beforeApprove(
    status: string,
    approvalTrans: any,
    funcID: string,
    title: string,
    formModel: FormModel
  ) {
    if (formModel) {
      this.cache.functionList('EST021').subscribe((fm) => {
        if (fm) {
          formModel = fm;
        }
      });
    }

    let _dialog: any;
    switch (status) {
      case '0': {
        //cancel
        if (approvalTrans.cancelControl != 1) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.cancelControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '2': {
        //redo
        if (
          approvalTrans.redoControl == '2' ||
          approvalTrans.redoControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.redoControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '5': {
        //duyet
        if (approvalTrans.approveControl != '1') {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.approveControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '4': {
        //reject
        if (
          approvalTrans.rejectControl == '2' ||
          approvalTrans.rejectControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.rejectControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
    }
    return _dialog;
  }

  beforeApproveUseRecID(
    status: string,
    recID: string,
    title: string,
    funcID: string = null
  ) {
    let formModel;
    let approvalTrans: any = {};

    this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetByRecIDAsync',
      [recID]
    );

    //console.log('ndhoa', approvalTrans);

    // let _dialog: any;
    // switch (status) {
    //   case '0': {
    //     //cancel
    //     if (approvalTrans.cancelControl != 1) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.cancelControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '2': {
    //     //redo
    //     if (
    //       approvalTrans.redoControl == '2' ||
    //       approvalTrans.redoControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.redoControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '5': {
    //     //duyet
    //     if (approvalTrans.approveControl != '1') {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.approveControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '4': {
    //     //reject
    //     if (
    //       approvalTrans.rejectControl == '2' ||
    //       approvalTrans.rejectControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.rejectControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    // }
    // return _dialog;
  }

  openPopupComment(
    status: string,
    funcControl: string,
    funcID: string,
    title: string,
    formModel: FormModel
  ) {
    let dialogComment = this.callfunc.openForm(
      PopupCommentComponent,
      title,
      500,
      500,
      funcID,
      {
        title: title,
        formModel: formModel,
        approveControl: funcControl,
        mode: status,
      }
    );
    return dialogComment;
  }

  #region_calendar;
  getDataTM_Tasks(requestData) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetTasksWithScheduleWPAsync',
      [requestData, true]
    );
  }

  getDataWP_Notes(predicate, dataValue) {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NotesBusiness',
      'GetListAsync',
      [predicate, dataValue]
    );
  }

  getDataWP_Notes_IsPin() {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NotesBusiness',
      'GetListIsPinAsync'
    );
  }

  getDataCO_Meetings(requestData) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetListMeetingsCalendarAsync',
      requestData
    );
  }

  getDataEP_Bookings(requestData) {
    return this.api.execSv(
      'EP',
      'EP',
      'BookingsBusiness',
      'GetListBookingCalendarAsync',
      requestData
    );
  }
  #endregion_calendar;

  #region_EP_Booking;
  getBookingByRecID(recID: string) {
    return this.api.exec<any>(
      'EP',
      'BookingsBusiness',
      'GetBookingByIDAsync',
      recID
    );
  }
  #endregion_EP_Booking;

  #region_EP_BookingCars;

  getListAttendees(recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingAttendeesBusiness',
      'GetAsync',
      [recID]
    );
  }
  #endregion_EP_BookingCars;

  #region_EP_BookingRooms;
  getListItems(recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingItemsBusiness',
      'GetAsync',
      [recID]
    );
  }
  #endregionEP_BookingRooms;

  getListResource(resourceType: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListResourceByTypeAsync',
      [resourceType]
    );
  }

  getThumbByUrl(url: any, width = 30) {
    if (url) {
      var wt = width;
      var widthThumb = 1.2;
      var arr = url.split('/');
      var uploadID = arr[arr.length - 2];

      if (width <= 30 * widthThumb) wt = 30;
      else if (width <= 60 * widthThumb) wt = 60;
      else if (width <= 120 * widthThumb) wt = 120;
      else if (width <= 300 * widthThumb) wt = 300;
      else if (width <= 500 * widthThumb) wt = 500;
      else if (width <= 650 * widthThumb) wt = 600;

      return (
        environment.urlUpload +
        '/api/' +
        environment.appName +
        '/thumbs/' +
        uploadID +
        '/' +
        wt +
        '.webp'
      );
    }
    return '';
  }
}

//#region Model
export class Approvers {
  recID: string;
  roleType: string;
  approver: string;
  name: string = null;
  position: string = null;
  email: string = null;
  phone: string = null;
  leadTime: any = 0;
  allowEditAreas: boolean;
  confirmControl: string;
  comment: string = null;
  icon: string = null;
  createdOn: any = new Date();
  delete: boolean = true;
  write: boolean = false;
}
//#endregion
