import { Injectable } from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import { ApiHttpService, AuthStore, UploadFile, UserModel } from 'codx-core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
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
  constructor(
    //private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore 
  ) {
    this.user = this.authStore.get();
  }

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
      'GetListDetailTasksAsync',
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
  saveAssign(data) {
    return this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'AddAssignToTaskAsync', data);
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
    return this.api.execSv<any>("SYS", "SYS", "MoreFunctionsBusiness", "GetWithPermAsync", data)
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

  setStatusTask(
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
      [id, status, datacomplete, hour, comment]
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
  deleteSprints(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'SprintsBusiness',
      'DeleteSprintsByIDAsync',
      id
    );
  }

  getChartData(
    model: Object,
    daySelectedFrom: Date,
    daySelectedTo: Date,
    fromDate: Date,
    toDate: Date,
    beginMonth: Date,
    endMonth: Date
  ) {
    return this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'GetGeneralDataAsync', [
      model,
      daySelectedFrom,
      daySelectedTo,
      fromDate,
      toDate,
      beginMonth,
      endMonth,
    ]);
  }

  convertListToObject(
    list: Array<object>,
    fieldName: string,
    fieldValue: string
  ) {
    if (!Array.isArray(list) || list.length == 0) return {};
    return list.reduce((a, v) => ({ ...a, [v[fieldName]]: v[fieldValue] }), {});
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
