import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  ApiHttpService,
  AuthStore,
  FormModel,
  UploadFile,
  UserModel,
  CacheService,
} from 'codx-core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { TM_TaskGroups } from './models/TM_TaskGroups.model';
import { TM_Parameter } from './models/TM_Tasks.model';

@Injectable({
  providedIn: 'root',
})
export class CodxTMService {
  active = '';
  data = [];
  moment = moment().locale('en');
  layoutcpn = new BehaviorSubject<LayoutModel>(null);
  layoutChange = this.layoutcpn.asObservable();
  user: UserModel;
  myTaskComponent = false;
  taskGroupComponent = false;
  aside = new BehaviorSubject<any>(null);
  toolbar = new BehaviorSubject<any>(null);
  menuClick = new BehaviorSubject<any>(null);
  urlback = '';
  functionParent = "TMT0301"
  constructor(
    private api: ApiHttpService,
    private authStore: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder
  ) {
    this.user = this.authStore.get();
  }
  hideAside = new BehaviorSubject<any>(null);

  lowerFirstLetter(character) {
    return character.charAt(0).toLowerCase() + character.slice(1);
  }

  execTM(
    className: string,
    methodName: string,
    data: any = null,
    uploadFiles: UploadFile[] = null
  ) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.TM,
      className,
      methodName,
      data
    );
  }

  loadTask(calendar, fromeDate, toDate, view, modeView) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetMyTasksAsync', [
      'TMT02',
      'grvTasks',
      calendar,
      fromeDate,
      toDate,
      view,
      modeView,
    ]);
  }

  loadTaskByAuthen(data) {
    return this.execTM(
      APICONSTANT.BUSINESS.TM.Task,
      'GetTasksAsync',
      [data]
    );
  }

  loadTaskGroupByAuthen(data) {
    return this.execTM(
      APICONSTANT.BUSINESS.TM.TaskGroups,
      'GetListTaskGroupsAsync',
      [data]
    );
  }

  loadColumnsKanban(data) {
    return this.execTM(
      APICONSTANT.BUSINESS.TM.Task,
      'GetColumnsKanbanAsync',
      data
    );
  }

  addTask(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'AddTaskAsync',
      data
    );
  }

  addTaskBoard(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'AddEditSprintAsync',
      data
    );
  }

  getMeetingID(id) {
    return this.api.execSv<any>(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetMeetingByIDAsync',
      id
    );
  }
  getCOMeetingByID(id) {
    return this.api.execSv<any>(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetCOMeetingByIDAsync',
      id
    );
  }

  setAutoStatusMeetings() {
    return this.api.execSv<any>('CO',
      'CO',
      'MeetingsBusiness',
      'SetAutoStatusMeetingAsync');
  }

  addTaskGroup(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskGroupBusiness',
      'AddTaskGroupsAsync',
      data
    );
  }

  updateTaskGroup(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskGroupBusiness',
      'UpdateTaskGroupsAsync',
      data
    );
  }

  update(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'UpdateTaskAsync',
      data
    );
  }

  updateDrap(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'UpdateAsync',
      data
    );
  }

  getValueCMParameter(predicate, dataValue) {
    return this.api.execSv(
      'SYS',
      'CM',
      'ParametersBusiness',
      'GetByPredicate',
      [predicate, dataValue]
    );
  }

  getMoreFunction(data) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetWithPermAsync',
      data
    );
  }

  getGridViewSetup(predicate, dataValue?) {
    return this.api.execSv(
      'SYS',
      'SYS',
      'GridViewSetupBusiness',
      'GetByPredicate',
      [predicate, dataValue]
    );
  }



  //update status
  setStatusTask(
    funcID: string,
    id: string,
    status: string,
    datacomplete: Date,
    hour: string,
    comment: string
  ) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'SetStatusTaskAsync',
      [funcID, id, status, datacomplete, hour, comment]
    );
  }
  //update tien độ thực hiện
  updateProgressTask(
    funcID: string,
    id: string,
    modifiedOn: Date,
    percentage: string,
    comment: string
  ) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'UpdateProgressTaskAsync',
      [funcID, id, modifiedOn, percentage, comment]
    );
  }

  setTaskGroupTask(id: string, taskGroupID: string) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'SetTaskGroupAsync',
      [id, taskGroupID]
    );
  }

  updateTaskGroup2(data) {
    let item = this.data.findIndex((p) => p.id == data.taskGroupID);
    if (item) {
      this.updateTaskGroup(item).subscribe((res) => {
        data = res;
      });
    }
  }

  updateListData(listTaskUpdate: Array<any>) {
    if (listTaskUpdate.length > 0) {
      listTaskUpdate.forEach((item: any) => {
        let index = this.data.findIndex((p) => p.id == item.id);
        if (index >= 0) {
          this.data[index] = item;
        } else {
          this.data.unshift(item);
        }
      });
    }
  }

  onChangeStatusTask(taskID, status) {
    let item = this.data.find((p) => p.id == taskID);
    if (item) {
      item.status = status;
      this.updateDrap(item).subscribe((result) => {
        this.updateListData([item]);
      });
    }
  }

  getTask(id) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetTaskByIdAsync', id);
  }

  deleteTask(taskID) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'DeleteTaskAsync', taskID);
  }

  getSprints(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'GetSprintByIDAsync',
      id
    );
  }

  getSprintsDetails(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'GetSprintDetailByIDAsync',
      id
    );
  }

  deleteSprints(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'DeleteSprintsByIDAsync',
      id
    );
  }

  getUserByListDepartmentID(listDepID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetUserByListDepartmentIDAsync',
      listDepID
    );
  }

  getListUserIDByListOrgIDAsync(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetListUserIDByListOrgIDAsync',
      data
    );
  }

  getResourcesTrackEvent(meetingID, data, startDate, endDate){
    return this.api.execSv<any>('CO','CO','MeetingsBusiness','AddResourcesEventAsync',[meetingID, data,startDate,endDate]);
  }

  convertListToObject(
    list: Array<object>,
    fieldName: string,
    fieldValue: string
  ) {
    if (!Array.isArray(list) || list.length == 0) return {};
    return list.reduce((a, v) => ({ ...a, [v[fieldName]]: v[fieldValue] }), {});
  }

  getMyDBData(model: Object, daySelected: any) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataMyDashboardAsync',
      [model, daySelected]
    );
  }

  getResourceAndProjectDBData(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataSprintsDetailsDashboardAsync',
      [model]
    );
  }

  getTeamDBData(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataTeamDashboardAsync',
      [model]
    );
  }

  getDeptDBData(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataDeptDashboardAsync',
      [model]
    );
  }

  getCompDBData(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataCompDashboardAsync',
      [model]
    );
  }

  sendMailAlert(recID: string, valueRuleNo: string, funcID: string){
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'SendAlertMailAsync',
      [recID, valueRuleNo, funcID]
    );
  }

  UpdateDateMeeting(meetingID: string, startDate, endDate){
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'UpdateDateMeetingAsync',
      [meetingID, startDate, endDate]
    );
  }

  changeBookingDateTime(recID, startDate, endDate){
    return this.api.execSv('CO','CO','MeetingsBusiness','ChangeBookingDateTimeAsync', [recID, startDate, endDate]);
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
        }
        resolve(formModel);
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

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
        if (gv) {
          const user = this.authStore.get();
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

  // convertParameterByTaskGroup(param: TM_Parameter, taskGroup: TM_TaskGroups) {
  //   param.ApproveBy = taskGroup.approveBy;
  //   param.ApproveControl = taskGroup.approveControl;
  //   param.AutoCompleted = taskGroup.autoCompleted;
  //   param.ConfirmControl = taskGroup.confirmControl;
  //   param.EditControl = taskGroup.editControl;
  //   param.LocationControl = taskGroup.locationControl;
  //   param.MaxHours = taskGroup.maxHours.toString();
  //   param.MaxHoursControl = taskGroup.maxHoursControl;
  //   param.PlanControl = taskGroup.planControl;
  //   param.ProjectControl = taskGroup.projectControl;
  //   param.UpdateControl = taskGroup.updateControl;
  //   param.VerifyBy = taskGroup.verifyBy;
  //   param.VerifyByType = taskGroup.verifyByType;
  //   param.VerifyControl = taskGroup.verifyControl;
  //   param.DueDateControl = taskGroup.dueDateControl;
  //   param.ExtendControl = taskGroup.extendControl ;
  //   param.ExtendBy = taskGroup.extendBy ;
  //   param.CompletedControl = taskGroup.completedControl;
  // }
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
