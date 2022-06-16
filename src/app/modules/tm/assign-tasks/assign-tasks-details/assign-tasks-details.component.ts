import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';
import { UpdateStatusPopupComponent } from '@modules/tm/controls/update-status-popup/update-status-popup.component';
import { TmService } from '@modules/tm/tm.service';
import { DataRequest } from '@shared/models/data.request';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxListviewComponent,
  NotificationsService,
  UrlUtil,
  ViewsComponent,
} from 'codx-core';
import * as moment from 'moment';

@Component({
  selector: 'assign-tasks-details',
  templateUrl: './assign-tasks-details.component.html',
  styleUrls: ['./assign-tasks-details.component.scss'],
})
export class AssignTaskDetailsComponent implements OnInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() data = [];
  taskChild = [];
  view: string;
  user: any;
  objectAssign: any;
  objectRoleType: any;
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
  innerHTML = '';
  funcID  : string ;
  moreFuncList : any[] =[];
  @Input('viewBase') viewBase: ViewsComponent;
  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(
    private tmSv: TmService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.tmSv.getMoreFunction([this.funcID, null,null]).subscribe(res=>{
      if(res){this.moreFuncList = res} ;
     })
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    const t = this;
    this.taskInfo.isAddNew.subscribe((res) => {
      if (res) {
        //    this.listview.addHandler(res, true, 'recID');
        this.data.push(res);
      }
    });
    this.taskInfo.isUpdate.subscribe((res) => {
      if (res) {
        var index = this.data.findIndex((x) => x.taskID == res.taskID);
        if (index != -1) {
          //  this.listview.addHandler(res, false, 'recID');
        } else {
          //   this.listview.addHandler(res, true, 'recID');
        }
        //  this.data = this.listview.data;
        if (t.itemSelected.taskID == res.taskID) {
          t.getOneItem(this.itemSelected.taskID);
          t.dt.detectChanges();
        }
      }
    });
  }

  loadData() {
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    // set max dinh
    this.fromDate = moment('4/20/2022').toDate();
    this.toDate = moment('12/30/2022').toDate();
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
        this.notiService.notifyCode('TM001');
        return;
      }
      //  var message = 'Bạn có chắc chắn muốn xóa task này !';
      this.notiService
<<<<<<< HEAD
        .alert('Cảnh báo', message, { type: 'YesNo' })
      // .subscribe((dialog: Dialog) => {
      //   var that = this;
      //   dialog.close = function (e) {
      //     return that.confirmDelete(e, that);
      //   };
      // });

    } else
      this.notiService.notify('Bạn chưa được cấp quyền này !');
=======
        //.alert('Cảnh báo', message, { type: 'YesNo' })
        .alertCode('TM003', { type: 'YesNo' })
        .subscribe((dialog: Dialog) => {
          var that = this;
          dialog.close = function (e) {
            return that.confirmDelete(e, that);
          };
        });
    } else this.notiService.notify('Bạn chưa được cấp quyền này !');
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9
  }

  viewItem(taskAction) {
    this.taskInfo.openInfo(taskAction.taskID, 'view');
  }

  setupStatus(p, item) {
    p.open();
  }

  confirmDelete(e: any, t: AssignTaskDetailsComponent) {
    if (e?.event?.status == 'Y') {
<<<<<<< HEAD
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
                    var taskDelete = t.data.find(x => x.taskID == lstTaskDelete[i].taskID);
                    //t.listview.removeHandler(taskDelete, 'recID');
                  }
                  if (res[1] != null) {
                    var parent = t.data.find(x => x.taskID == res[1].taskID);
                    parent.assignTo = res[1].assignTo;
                    parent.category = res[1].category;
                    // t.listview.addHandler(parent, false, 'recID');
                  }
                  // t.notiService.notifyCode("TM004")
                  t.notiService.notify('Xóa task thành công !');
                  // t.data = t.listview.data;
                  t.itemSelected = t.data[0];
                  t.getOneItem(t.itemSelected.taskID)
                  return;
                }
                t.notiService.notify(
                  'Xóa task không thành công. Vui lòng kiểm tra lại !'
                );
              });
=======
      t.tmSv.deleteTask(t.taskAction.taskID).subscribe((res) => {
        if (res[0]) {
          var lstTaskDelete = res[0];
          for (var i = 0; i < lstTaskDelete.length; i++) {
            var taskDelete = t.data.find(
              (x) => x.taskID == lstTaskDelete[i].taskID
            );
            t.listview.removeHandler(taskDelete, 'recID');
          }
          if (res[1] != null) {
            var parent = t.data.find((x) => x.taskID == res[1].taskID);
            if (parent) {
              parent.assignTo = res[1].assignTo;
              parent.category = res[1].category;
              t.listview.addHandler(parent, false, 'recID');
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9
            }
          }
          t.notiService.notifyCode('TM004');
          //   t.notiService.notify('Xóa task thành công !');
          t.data = t.listview.data;
          t.itemSelected = t.data[0];
          t.getOneItem(t.itemSelected.taskID);
          return;
        }
        t.notiService.notify(
          'Xóa task không thành công. Vui lòng kiểm tra lại !'
        );
      });
    }
  }

  ChangeStatusTask(moreFunc, taskAction) {
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
            this.openPopupUpdateStatus(fieldValue, moreFunc, taskAction);
          } else {
            var completedOn = moment(new Date()).toDate();
            var startDate = moment(new Date(taskAction.startDate)).toDate();
            var estimated = moment(completedOn).diff(
              moment(startDate),
              'hours'
            );
            var status = UrlUtil.getUrl(
              "defaultValue",
              moreFunc.url,
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
                  //  this.listview.addHandler(taskAction, false, 'recID');
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

  openPopupUpdateStatus(fieldValue, moreFunc, taskAction) {
    let obj = {
      fieldValue: fieldValue,
      moreFunc: moreFunc,
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
    // .subscribe((dt: any) => {
    //   dt.close = this.closePopup;
    // });
  }

  closePopup(e: any) {
    if (e.closedBy == 'user action') {
      var task = e.event;

      // this.listview.addHandler(task, false, 'recID');
    }
  }

  openShowNode() {
    //dang fail
    //  this.openNode = !this.openNode;
  }

  loadDetailTask(task) {
    this.objectAssign = '';
    this.objectRoleType = '';
    if (task.category =='3') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskResourcesBusiness',
          'GetListTaskResourcesByTaskIDAsync',
          [task?.taskID]
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.countOwner = res.length;
            let objectId = res[0].resourceID;
            let objectRoleType = res[0].roleType;
            for (let i = 1; i < res?.length; i++) {
              objectId += ';' + res[i].resourceID;
              objectRoleType += ';' + res[i].roleType;
            }
            this.objectAssign = objectId;
            this.objectRoleType = objectRoleType;
          }
        });
    } else {
<<<<<<< HEAD
      this.countOwner = 1
=======
      this.countOwner = 1;
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9
    }
    this.listNode = [];
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
    this.isFinishLoad = true;
  }

  changeRowSelected(event) {
    this.itemSelected = event;
    this.data = this.listview?.data;
    if (this.itemSelected != null) {
      this.isFinishLoad = true;
      this.loadDetailTask(this.itemSelected);
    } else this.isFinishLoad = false;
  }
}
