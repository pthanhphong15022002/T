import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  ApiHttpService,
  AuthStore,
  FormModel,
  UploadFile,
  UserModel,
  CacheService,
  Util,
} from 'codx-core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxTMService {
  active = '';
  data = [];
  moment = moment().locale('en');
  layoutcpn = new BehaviorSubject<LayoutModel>(null);
  SetLayout = new BehaviorSubject<any>(null);
  layoutChange = this.layoutcpn.asObservable();
  user: UserModel;
  myTaskComponent = false;
  taskGroupComponent = false;
  aside = new BehaviorSubject<any>(null);
  toolbar = new BehaviorSubject<any>(null);
  childMenuClick = new BehaviorSubject<any>(null);
  urlback = '';
  functionParent = 'TMT0301';
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
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetTasksAsync', [data]);
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
    return this.api.execSv<any>(
      'CO',
      'CO',
      'MeetingsBusiness',
      'SetAutoStatusMeetingAsync'
    );
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

  updateTMTask(data) {
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
      'Core',
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
  getListUserIDByListPositionsID(listPositionID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
    );
  }

  getListUserIDByListGroupID(listGroupID) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'GroupMembersBusiness',
      'GetListUserIDByListGroupIDAsync',
      listGroupID
    );
  }

  getResourcesTrackEvent(meetingID, data, startDate, endDate) {
    return this.api.execSv<any>(
      'CO',
      'CO',
      'MeetingsBusiness',
      'AddResourcesEventAsync',
      [meetingID, data, startDate, endDate]
    );
  }
  getListUserIDByListEmployeeID(listEmployeeID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDbyListEmployeeIDAsync',
      listEmployeeID
    );
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

  getDataDetailsDashboard(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataDetailsDashboardAsync',
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

  getAssignDBData(model: Object) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetDataAssignDashboardAsync',
      [model]
    );
  }

  sendMailAlert(recID: string, valueRuleNo: string, funcID: string) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'SendAlertMailAsync',
      [recID, valueRuleNo, funcID]
    );
  }

  RPASendMailAlert() {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'RPASendAlertMeetingMailAsync'
    );
  }

  UpdateDateMeeting(
    meetingID: string,
    startDate,
    endDate,
    funcID: string,
    comment: string,
    location: string
  ) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'UpdateDateMeetingAsync',
      [meetingID, startDate, endDate, funcID, comment, location]
    );
  }

  SendMailNewResources(
    recID: string,
    valueNo: string,
    funcID: string,
    resources
  ) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'SendAlertMailNewResourcesAsync',
      [recID, valueNo, funcID, resources]
    );
  }

  RPASendMailMeeting(valueNo: string, funcID: string) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'RPASendAlertMailAsync',
      [valueNo, funcID]
    );
  }

  changeBookingDateTime(recID, startDate, endDate, resourceID) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'ChangeBookingDateTimeAsync',
      [recID, startDate, endDate, resourceID]
    );
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
  //cai thang này đe sinh instanceID - trước kia hàm add nó sinh giờ ko sinh thì t tự sinh
  genAutoNumber(funcID: any, entityName: string, key: any) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GenAutoNumberAsync',
      [funcID, entityName, key]
    );
  }

  //update res sprint
  upResourceSprint(iterationID, rescourceNew) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'UpdatesResoureSprintsAsync',
      [iterationID, rescourceNew]
    );
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
  //   param.Approvers = taskGroup.approvers;
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
  //   param.ExtendControl = taskGroup.extendControl;
  //   param.ExtendBy = taskGroup.extendBy;
  //   param.CompletedControl = taskGroup.completedControl;
  //   return param
  // }

  countFavoriteSystem(funcID: any, favsID: any) {
    return this.api.execSv(
      'TM',
      'Core',
      'DataBusiness',
      'GetCountFavoriteAsync',
      [funcID, favsID]
    );
  }
  //đếm count theo dõi= chua viet
  countFavoriteMonitorTasks(funcID, favsID) {
    return this.api.execSv(
      'TM',
      'TM',
      'TasksBusiness',
      'CountFavoriteModuleAsync',
      [funcID, favsID]
    );
  }
  //count động
  countFavorite(funcID: any, favsID: any, assemblyName, className, methol) {
    return this.api.execSv('TM', assemblyName, className, methol, [
      funcID,
      favsID,
    ]);
  }

  getFormGroupV2(formName, gridView): Promise<FormGroup> {
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
    });
  }

  getProject(projectID) {
    return this.api.exec<any>(
      'PM',
      'ProjectsBusiness',
      'GetProjectByIDAsync',
      projectID
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
