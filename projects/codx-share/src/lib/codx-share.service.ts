import { BehaviorSubject, of } from 'rxjs';
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
} from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupCommentComponent } from 'projects/codx-es/src/lib/sign-file/popup-comment/popup-comment.component';

@Injectable({
  providedIn: 'root',
})
export class CodxShareService {
  hideAside = new BehaviorSubject<any>(null);
  dataRefreshImage = new BehaviorSubject<any>(null);
  dataUpdateShowEvent = new BehaviorSubject<any>(null);
  constructor(
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder
  ) {}
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
      case 'SYS005': {
        var task = new TM_Tasks();
        task.refID = data?.recID;
        task.refType = formModel.entityName;
        var vllControlShare = 'TM003';
        var vllRose = 'TM002';
        var title = val?.data.customName;
        let option = new SidebarModel();
        option.DataService = dataService;
        option.FormModel = formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          AssignInfoComponent,
          [task, vllControlShare, vllRose, title],
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
    return this.api.execSv<any>('ES', 'CM', 'DataBusiness', 'GetDefaultAsync', [
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
      'ERM.Business.CM',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
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
          console.log(user);

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
  getDataCO_Meetings(requestData) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetListMeetingsAsync',
      requestData
    );
  }

  getDataEP_Bookings(requestData) {
    return this.api.execSv(
      'EP',
      'EP',
      'BookingsBusiness',
      'GetListBookingAsync',
      requestData
    );
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
