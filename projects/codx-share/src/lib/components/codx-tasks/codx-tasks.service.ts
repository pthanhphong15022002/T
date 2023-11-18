import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { tmpReferences } from '../../models/assign-task.model';

@Injectable({
  providedIn: 'root',
})
export class CodxTasksService {
  urlback = '';

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private cache: CacheService
  ) {}

  getTask(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetTaskByIdAsync',
      id
    );
  }

  deleteTask(taskID) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'DeleteTaskAsync',
      taskID
    );
  }
  //get Tree
  getListTree(model) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetListTreeDetailTasksAsync',
      model
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
  getListUserIDByListPositionsID(listPositionID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
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

  getListUserIDByListGroupID(listGroupID) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'GroupMembersBusiness',
      'GetListUserIDByListGroupIDAsync',
      listGroupID
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

  //sendMail
  sendAlertMail(
    recID: string,
    valueRuleNo: string,
    funcID: string,
    recIDTaskExtend: string = null
  ) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'SendAlertMailAsync',
      [recID, valueRuleNo, funcID, recIDTaskExtend]
    );
  }

  //getRecID
  getRecIDTaskByIdAsync(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetRecIDTaskByIdAsync',
      id
    );
  }
  saveAssign(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'AddAssignToTaskAsync',
      data
    );
  }

  checkEdit(taskID) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'IsCanClickEditTaskByTaskIDAsync',
      taskID
    );
  }

  //get listTaskGoad
  getListTaskGoad(taskID) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetListTaskGoalByTaskIDAsync',
      taskID
    );
  }

  // edit Task từ service để modeule khác có thể gọi vào được.....................
  editTask(
    recID, // recID data Tasks
    funcID, // func nghiep vu
    titleAction, // tiêu đề form
    afterSave?: Function, // hàm trả kết quả về
    data = null // data Tasks - nếu có thể truyền thằng như vậy
  ) {
    if (data) {
      if (data && !'00,07,09,10,20'.includes(data.status)) {
        this.notiService.notifyCode('TM013');
        return;
      } else if (
        data.category == '1' &&
        data.verifyControl == '1' &&
        data.status != '00'
      ) {
        this.notiService.notifyCode('TM014');
        return;
      }
      if (data.category == '1' || data.category == '2') {
        this.editConfirm(data, funcID, false, titleAction);
      } else {
        var isCanEdit = true;
        this.api
          .execSv<any>(
            'TM',
            'ERM.Business.TM',
            'TaskBusiness',
            'GetListTaskChildDetailAsync',
            data.taskID
          )
          .subscribe((res: any) => {
            if (res && res?.length > 0) {
              for (let i = 0; i < res.length; i++) {
                let element = res[i];
                if (element.status != '00' && element.status != '10') {
                  isCanEdit = false;
                  break;
                }
              }
              if (!isCanEdit) {
                this.notiService.notifyCode('TM016');
              } else {
                this.editConfirm(data, funcID, true, titleAction, afterSave);
              }
            }
          });
      }
    } else {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskUpdateByRecIDAsync',
          recID
        )
        .subscribe((res: any) => {
          if (res && res?.length > 0) {
            let task = res[0];
            let listUserDetail = res[1] || [];
            let listTodo = res[2];
            let listTaskResources = res[3];
            this.editConfirm(
              task,
              funcID,
              task.category == '3',
              titleAction,
              afterSave,
              true,
              listUserDetail,
              listTodo,
              listTaskResources
            );
          }
        });
    }
  }
  editConfirm(
    data,
    funcID,
    isAssignTask, //la giao việc
    titleAction,
    afterSave?: Function,
    isLoadedData = false,
    listUserDetail = [],
    listTodo = [],
    listTaskResources = []
  ) {
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        let formModel = new FormModel();
        let option = new SidebarModel();
        this.cache.gridView(f.gridViewName).subscribe((res) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .subscribe((grvSetup) => {
              if (grvSetup) {
                formModel.funcID = funcID;
                formModel.entityName = f.entityName;
                formModel.formName = f.formName;
                formModel.gridViewName = f.gridViewName;
                option.FormModel = formModel;
                option.Width = '800px';
                option.zIndex = 1001;

                let obj = {
                  data: data,
                  action: 'edit',
                  isAssignTask: isAssignTask,
                  titleAction: titleAction,
                  functionID: funcID,
                  isOtherModule: true,
                  isLoadedData: isLoadedData,
                  listUserDetail: listUserDetail,
                  listTodo: listTodo,
                  listTaskResources: listTaskResources,
                };
                let dialog = this.callfc.openSide(
                  PopupAddComponent,
                  obj,
                  option
                );
                dialog.closed.subscribe((e) => {
                  // if (e?.event && e?.event != null) {
                  afterSave(e?.event);
                  // }
                });
              }
            });
        });
      }
    });
  }
  //end

  //clear Reference Task -VTHAO
  getReference(
    refType, // refType task
    refID, // recID cua nv dc ref
    getRef?: Function, // hàm trả kết quả về
    service = null, // service goi ham
    className = null, // class chua ham
    methol = 'GetTempReferenceByRefIDAsync' //ten ham get
  ) {
    let dataReferences = [];
    switch (refType) {
      case 'OD_Dispatches':
        service = 'OD';
        className = 'DispatchesBusiness';
        break;
      case 'ES_SignFiles':
        service = 'ES';
        className = 'SignFilesBusiness';
        break;
      case 'CO_Meetings':
        service = 'CO';
        className = 'MeetingsBusiness';
        break;
      //case 'TM_Sprints':
      case 'TM_Tasks':
        service = 'TM';
        className = 'TaskBusiness';
        break;
      case 'DP_Instances_Steps_Tasks':
        service = 'DP';
        className = 'InstancesBusiness';
        break;
      case 'OM_OKRs':
        service = 'OM';
        className = 'OKRBusiness';
        break;
      default:
        getRef(dataReferences);
        return;
    }
    this.api
      .execSv<any>(service, service, className, methol, refID)
      .subscribe((result) => {
        if (result && result?.length > 0) {
          dataReferences = result;
        }
        getRef(dataReferences);
      });
  }

  //get Task Tree-- OD +ES  + .. --chưa xử lý hết chỗ khác gom về
  getTreeAssign(
    refID,
    refType,
    getTree?: Function,
    sessionID = null,
    taskID = null //dùng cho serviceTask gọi riêng- chưa đưa về
  ) {
    let methol = 'GetListTaskTreeByRefIDAsync';
    if (!sessionID) {
      if (refID && refType) {
        switch (refType) {
          case 'OD_Dispatches':
          case 'ES_SignFiles':
            //  case 'TM_Tasks':  //truong hop nay dacbiet hon tí chuyển sau tính sau
            methol = 'GetListTaskTreeByRefIDAsync';
            break;
          default:
            debugger;
            getTree([]);
            return;
        }
        this.api
          .execSv<any>('TM', 'ERM.Business.TM', 'TaskBusiness', methol, refID)
          .subscribe((res) => {
            debugger;
            getTree(res);
          });
      } else getTree([]);
    } else {
      //chua chuyen code xong
      getTree([]);
    }
  }
}
