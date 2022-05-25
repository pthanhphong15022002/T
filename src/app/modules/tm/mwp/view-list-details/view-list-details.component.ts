import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';

import { UpdateStatusPopupComponent } from '@modules/tm/controls/update-status-popup/update-status-popup.component';
import { TmService } from '@modules/tm/tm.service';
import { HomeComponent } from '@pages/home/home.component';
import { TagsComponent } from '@shared/layout/tags/tags.component';
import { DataRequest } from '@shared/models/data.request';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxListviewComponent,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { mode } from 'crypto-js';
import * as moment from 'moment';

@Component({
  selector: 'app-view-list-details',
  templateUrl: './view-list-details.component.html',
  styleUrls: ['./view-list-details.component.scss'],
})
export class ViewListDetailsComponent implements OnInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() data = [];
  @Input() dataAddNew = [];
  @Input() dataCompleted = [];
  @Input() dataPostpone = [];
  @Input() dataRefuse = [];

  view: string;
  user: any;
  objectAssign: any;
  objectState: any;
  itemSelected = null;
  moment = moment().locale('en');
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf('day').toDate();
  toDate: Date = moment(this.today).endOf('day').toDate();
  configParam = null;
  dateNow: string = '';
  yesterday = '';
  dataObj = { view: 'listDetails', viewBoardID: '' };
  gridView: any;
  listUserTask = [];
  listNode = [];
  isFinishLoad = false;
  taskAction: any;
  countOwner = 0;
  model = new DataRequest();
  openNode = false;
  tabSt = '1';
  predicate ='Status=@0';
  dataValue = '1';
  @Input('viewBase') viewBase: ViewsComponent;
  @ViewChild('listviewAdd') listviewAdd: CodxListviewComponent;
  @ViewChild('listviewCompleted') listviewCompleted: CodxListviewComponent;
  @ViewChild('listviewPostpone') listviewPostpone: CodxListviewComponent;
  @ViewChild('listviewRefuse') listviewRefuse: CodxListviewComponent;
  @ViewChild('listview') listview: CodxListviewComponent;


  constructor(
    private tmSv: TmService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.loadData();
   this.isFinishLoad  = true;
  }

  ngAfterViewInit(): void {
    const t = this;
    this.taskInfo.isAddNew.subscribe((res) => {
      if (res) {
        this.listviewAdd.addHandler(res, true, 'recID');
        this.data.push(res);
        this.dataAddNew.push(res);
      }
    });
    // this.taskInfo.isUpdate.subscribe((res) => {
    //   if (res) {
    //     var index = this.data.findIndex((x) => x.taskID == res.taskID);
    //     if (index != -1) {
    //       this.listview.addHandler(res, false, 'recID');
    //     } else {
    //       this.listview.addHandler(res, true, 'recID');
    //     }
    //     this.data = this.listview.data;
    //     if (t.itemSelected.taskID == res.taskID) {
    //       t.getOneItem(this.itemSelected.taskID);
    //       t.dt.detectChanges();
    //     }
    //   }
    // });
  }

  loadData() {
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
     model.funcID = 'WPT036';
     model.page = 1;
     model.pageSize = 20;
    // set max dinh
    this.fromDate = moment('4/20/2022').toDate();
    this.toDate = moment('5/31/2022').toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.toDate },
      ],
    };
    let dataObj = { view: this.view, viewBoardID: '' }; 
    model.dataObj = JSON.stringify(dataObj);
    this.model = model;
    //const t = this;
    // t.tmSv.loadTaskByAuthen(model).subscribe((res) => {
    //   if (res && res.length) {
    //     this.data = res[0];
    //     // this.classifyStatus(this.data);
    //     // this.itemSelected = res[0][0];
    //     // this.loadDetailTask(this.itemSelected);
    //   } else {
    //     this.data = [];
    //   }
    //   t.dt.detectChanges();
    // });
  }

  trackByFn(index: number, item): string {
    return item.taskID;
  }

  clickItem(item) {
    this.openNode = false;
    this.getOneItem(item.id);
  }
  getOneItem(id) {
    var itemDefault = this.data.find((item) => item.id == id);
    if (itemDefault != null) {
      this.itemSelected = itemDefault;
    } else {
      this.itemSelected = this.data[0];
    }
    this.loadDetailTask(this.itemSelected);
  }

  getByParentID(task) {
    let objectId = '';
    let objectState = '';
    if (task != null) {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskByParentIDAsync',
          [task?.id]
        )
        .subscribe((res) => {
          if (res && res?.length > 0) {
            res.forEach((element) => {
              objectId += ';' + element.owner;
              objectState += ';' + element.status;
            });
          }
        });
    }
    this.objectAssign = objectId;
    return objectState;
  }

  ///test control
  showControl(p, item) {
    this.taskAction = item;
    p.open();
  }
  editTask(taskAction) {
    if (!taskAction.write) {
      this.notiService.notify('Bạn chưa được cấp quyền này !');
      return;
    }
    if (taskAction.status < 8) {
      this.taskInfo.openInfo(taskAction.taskID, 'edit');
    } else {
      var message = 'Không thể chỉnh sửa công việc này !';
      if (taskAction.status == 8) {
        message = 'Công việc này đã bị hủy ! ' + message;
      }
      if (taskAction.status == 9) {
        message = 'Công việc này đã hoàn thành ! ' + message;
      }
      this.notiService.notify(message);
    }
  }

  copyDetailTask(taskAction) {
    if (!taskAction.share) {
      this.notiService.notify('Bạn chưa được cấp quyền này !');
      return;
    }
    this.taskInfo.getTaskCoppied(taskAction.taskID);
  }

  clickDelete(taskAction) {
    if (taskAction.delete) {
      if (taskAction.status == 9) {
        // this.notiService.notifyCode("TM001")
        this.notiService.notify(
          'Không thể xóa công việc này. Vui lòng kiểm tra lại!'
        );
        return;
      }
      var message = 'Bạn có chắc chắn muốn xóa task này !';
      this.notiService
        .alert('Cảnh báo', message, { type: 'YesNo' })
        .subscribe((dialog: Dialog) => {
          var that = this;
          dialog.close = function (e) {
            return that.confirmDelete(e, that);
          };
        });
    } else this.notiService.notify('Bạn chưa được cấp quyền này !');
  }

  viewItem(taskAction) {
    this.taskInfo.openInfo(taskAction.taskID, 'view');
  }

  setupStatus(p, item) {
    p.open();
  }

  confirmDelete(e: any, t: ViewListDetailsComponent) {
    if (e?.event?.status == 'Y') {
      var isCanDelete = true;
      t.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskChildDetailAsync',
          t.taskAction.taskID
        )
        .subscribe((res: any) => {
          if (res) {
            res.forEach((element) => {
              if (element.status != '1') {
                isCanDelete = false;
                return;
              }
            });
            if (!isCanDelete) {
              // this.notiService.notifyCode("TM001")
              t.notiService.notify(
                'Đã có phát sinh công việc liên quan, không thể xóa công việc này. Vui lòng kiểm tra lại!'
              );
            } else {
              t.tmSv.deleteTask(t.taskAction.taskID).subscribe((res) => {
                if (res[0]) {
                  var lstTaskDelete = res[0];
                  for (var i = 0; i < lstTaskDelete.length; i++) {
                    var data = t.dataOfStatus(lstTaskDelete[i].status)
                    var taskDelete = data.find(
                      (x) => x.taskID == lstTaskDelete[i].taskID
                    );
                    var lv = t.lvOfStatus(taskDelete.status)
                    lv.removeHandler(taskDelete, 'recID');

                  }
                  t.notiService.notify('Xóa task thành công !');
                  if (res[1] != null) {
                    var dt = t.dataOfStatus(res[i].status)
                    var parent = dt.find((x) => x.taskID == res[1].taskID);
                    parent.assignTo = res[1].assignTo;
                    parent.category = res[1].category;
                    var lv = t.lvOfStatus(parent.status)
                   lv.addHandler(parent, false, 'recID');
                  }
                  // t.notiService.notifyCode("TM004")
                
                  // t.data = t.listview.data;
                  // t.itemSelected = t.data[0];
                  // t.getOneItem(t.itemSelected.taskID);
                  return;
                }
                t.notiService.notify(
                  'Xóa task không thành công. Vui lòng kiểm tra lại !'
                );
              });
            }
          }
        });
    }
  }

  ChangeStatusTask(status, taskAction) {
    const fromName = 'TM_Parameters';
    const fieldName = 'UpdateControl';
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        [fromName, null, fieldName]
      )
      .subscribe((res) => {
        if (res) {
          var fieldValue = res.fieldValue;
          if (fieldValue != '0') {
            this.openPopupUpdateStatus(fieldValue, status, taskAction);
          } else {
            var completedOn = moment(new Date()).toDate();
            var startDate = moment(new Date(taskAction.startDate)).toDate();
            var estimated = moment(completedOn).diff(
              moment(startDate),
              'hours'
            );
            this.tmSv
              .setStatusTask(
                taskAction.taskID,
                status,
                completedOn,
                estimated.toString(),
                ''
              )
              .subscribe((res) => {
                if (res) {
                  taskAction.status = status;
                  taskAction.completedOn = completedOn;
                  taskAction.comment = '';
                  taskAction.completed = estimated;
                  this.listview.addHandler(taskAction, false, 'recID');
                  this.notiService.notify('Cập nhật trạng thái thành công !');
                } else {
                  this.notiService.notify(
                    'Vui lòng thực hiện hết các công việc được phân công để thực hiện cập nhật tình trạng !'
                  );
                }
              });
          }
        }
      });
  }

  openPopupUpdateStatus(fieldValue, status, taskAction) {
    let obj = {
      fieldValue: fieldValue,
      status: status,
      taskAction: taskAction,
    };
    this.callfc
      .openForm(
        UpdateStatusPopupComponent,
        'Cập nhật tình trạng',
        500,
        350,
        '',
        obj
      )
      .subscribe((dt: any) => {
        dt.close = this.closePopup;
      });
  }

  closePopup(e: any) {
    if (e.closedBy == 'user action') {
      var task = e.event;
      var lv = this.lvOfStatus(task.status)
      var crrLv = this.lvOfStatus(this.tabSt)
      if(task.status!=this.tabSt){
        crrLv.removeHandler(task, 'recID');
        lv.addHandler(task, false, 'recID');
      }else{
        crrLv.addHandler(task, false, 'recID');
      }
    
    }
  }

  openShowNode() {
    this.openNode = !this.openNode;
  }

  classifyStatus(data) {
    for (var i = 0; i < data.length; i++) {
      var obj = this.data[i];
      switch (obj.status) {
        case '1':
          this.dataAddNew.push(obj);
          break;
        case '9':
          this.dataCompleted.push(obj);
          break;
        case '5':
          this.dataPostpone.push(obj);
          break;
        case '8':
          this.dataRefuse.push(obj);
          break;
        default:
          break;
      }
    }
  }

  tabStatus(st:string){
    switch (st) {
      case '1':
        this.dataAddNew = this.listview.data
        this.itemSelected = this.dataAddNew[0];
        this.dataValue='1'
        break;
      case '9':
        this.itemSelected = this.dataCompleted[0];
        this.tabSt ='9' ;
        this.dataValue='9'
        break;
      case '5':
        this.itemSelected = this.dataPostpone[0];
        this.tabSt ='5' ;
        this.dataValue='5'
        break;
      case '8':
        this.itemSelected = this.dataRefuse[0];
        this.tabSt ='8' ;
        this.dataValue='8'
        break;
      default:
        break;
    }
   this.loadDetailTask(this.itemSelected);
    
  }

  lvOfStatus(st) : any{
    switch (st) {
      case '1':
      return this.listviewAdd
      case '9':
        return this.listviewCompleted
      case '5':
        return this.listviewPostpone
      case '8':
        return this.listviewRefuse
    }
  }
  dataOfStatus(st) : any{
    switch (st) {
      case '1':
      return this.dataAddNew
      case '9':
        return this.dataCompleted
      case '5':
        return this.dataPostpone
      case '8':
        return this.dataRefuse
    }
  }

  loadDetailTask(task){
    if (
      task.category == '3' ||
      task.category == '4'
    ) {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskByParentIDAsync',
          [task?.recID]
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            let objectId = res[0].owner;
            let objectState = res[0].status;
            for (let i = 1; i < res?.length; i++) {
              objectId += ';' + res[i].owner;
              objectState += ';' + res[i].status;
            }
            this.objectAssign = objectId;
            this.objectState = objectState;
          }
        });
    }
    if (task?.category != '1') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTasksTreeAsync',
          task?.id
        )
        .subscribe((res) => {
          this.listNode = res;
        });
    }
    this.isFinishLoad = true ;
  }
}
