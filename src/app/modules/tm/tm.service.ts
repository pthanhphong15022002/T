import { Injectable } from "@angular/core";
import { APICONSTANT } from "@shared/constant/api-const";
import { ApiHttpService, AuthStore, UploadFile, UserModel } from "codx-core";
import moment from "moment";
import { BehaviorSubject } from "rxjs";
import { CopyForm, DataSv, InfoOpenForm } from "./models/task.model";

@Injectable({
  providedIn: 'root'
})
export class TmService {
  active = "";
  data = [];
  moment = moment().locale("en");
  public changeData = new BehaviorSubject<DataSv>(null);
  isChangeData = this.changeData.asObservable();
  public changeMyTask = new BehaviorSubject<DataSv>(null);
  ischangeMyTask = this.changeData.asObservable();
  public showPanel = new BehaviorSubject<InfoOpenForm>(null);
  isShowPanel = this.showPanel.asObservable();
  public copyTask = new BehaviorSubject<CopyForm>(null);
  isCopy = this.copyTask.asObservable();
  user: UserModel;

  myTaskComponent = false;
  taskGroupComponent = false;
  constructor(
    //private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    //private dmDialog: CustomdialogService,    //nam trong share

  ) {
    this.user = this.authStore.get();
  }

  lowerFirstLetter(character) {
    return character.charAt(0).toLowerCase() + character.slice(1);
  }

  execTM(className: string, methodName: string, data: any = null, uploadFiles: UploadFile[] = null) {
    return this.api.exec<any>(APICONSTANT.ASSEMBLY.TM, className, methodName, data);
  }

  loadTask(calendar, fromeDate, toDate, view, modeView) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetMyTasksAsync', ['TMT02', 'grvTasks', calendar, fromeDate, toDate, view, modeView]);
  }


  loadTaskByAuthen(data) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetListDetailTasksAsync', [data]);
  }

  loadTaskGroupByAuthen(data) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetListTaskGroupsAsync', [data]);
  }

  loadColumnsKanban(data) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, 'GetColumnsKanbanAsync', data)
  }

  addTask(data) {
    return this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'AddTaskAsync', data);
  }
  addTaskGroup(data) {
    return this.api.execSv<any>('TM', 'TM', 'TaskGroupBusiness', 'AddTaskGroupsAsync', data);
  }
  update(data) {
    return this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateTaskAsync', data);
  }

  updateDrap(data) {
    return this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', data);
  }

  getValueCMParameter(predicate, dataValue) {
    return this.api.execSv("SYS", "CM", "ParametersBusiness", "GetByPredicate", [predicate, dataValue]);
  }

  getGridViewSetup(predicate, dataValue?) {
    return this.api.execSv("SYS", "SYS", "GridViewSetupBusiness", "GetByPredicate", [predicate, dataValue]);
  }


  setStatusTask(id: string, status: string, datacomplete: Date, hour: string, comment: string) {
    return this.api.execSv<any>("TM", "TM", "TaskBusiness", "SetStatusTaskAsync", [id, status, datacomplete, hour, comment]);
  }

  setTaskGroupTask(id: string, taskGroupID: string) {
    return this.api.execSv<any>("TM", "TM", "TaskBusiness", "SetTaskGroupAsync", [id, taskGroupID]);
  }
  setChangeData(data) {
    this.data = data.data;
    this.changeData.next(data);
  }
  updateListData(listTaskUpdate: Array<any>) {
    if (listTaskUpdate.length > 0) {
      listTaskUpdate.forEach((item: any) => {
        let index = this.data.findIndex(p => p.id == item.id);
        if (index >= 0) {
          this.data[index] = item;
        }
        else {
          this.data.unshift(item);
        }
      })
      this.changeData.next(new DataSv(this.data, ''));
    }
  }

  onChangeStatusTask(taskID, status) {
    let item = this.data.find(p => p.id == taskID);
    if (item) {
      item.status = status;
      this.updateDrap(item).subscribe((result) => {
        this.updateListData([item]);
      });
    }
  }
  getTask(id) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, "GetTaskByIdAsync", id);
  }
  deleteTask(taskID) {
    return this.execTM(APICONSTANT.BUSINESS.TM.Task, "DeleteTaskAsync", taskID);
  }

  //model nam trong dm
  // openAttach(entity, objectID, functionID) {
  //   var data = new DataItem();
  //   data.recID = "";
  //   data.type = "file";
  //   data.fullName = "";
  //   data.copy = false;
  //   data.dialog = "edit";
  //   data.id_to = "";
  //   data.remote = true;
  //   data.objectType = entity;
  //   data.objectID = objectID;
  //   data.functionID = functionID;
  //   this.dmDialog.OpenDialog(data);
  //   this.dmDialog.CloseDialog();

  // }
  // CloseDialogAttach() {
  //   this.dmDialog.CloseDialog();

  // }
  convertListToObject(list: Array<object>, fieldName: string, fieldValue: string) {
    if (!Array.isArray(list) || list.length == 0) return {};
    return list.reduce((a, v) => ({ ...a, [v[fieldName]]: v[fieldValue] }), {});
  }
}
