import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataRequest } from '@shared/models/data.request';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxListviewComponent,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import * as moment from 'moment';
import { TaskInfoComponent } from '../../controls/task-info/task-info.component';
import { UpdateStatusPopupComponent } from '../../controls/update-status-popup/update-status-popup.component';
import { TmService } from '../../tm.service';

@Component({
  selector: 'owner-task-details',
  templateUrl: './owner-task-details.component.html',
  styleUrls: ['./owner-task-details.component.scss'],
})
export class OnwerTaskDetailsComponent implements OnInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() data = [];
  taskChild = [];
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
  innerHTML = ''
  @Input('viewBase') viewBase: ViewsComponent;
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
  }

  ngAfterViewInit(): void {
    const t = this;
    this.taskInfo.isAddNew.subscribe((res) => {
      if (res) {
        this.listview.addHandler(res, true, 'recID');
        this.data.push(res);
      }
    });
    this.taskInfo.isUpdate.subscribe((res) => {
      if (res) {
        var index = this.data.findIndex(x => x.taskID == res.taskID);
        if (index != -1) {
          this.listview.addHandler(res, false, 'recID');
        } else {
          this.listview.addHandler(res, true, 'recID');
        }
        this.data = this.listview.data;
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
    model.predicate = '';
    model.funcID = "TMT02" ;
    model.page = 1;
    model.pageSize = 100;
    // model.predicate = 'Owner=@0';
    // model.dataValue = this.user.userID;
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
    const t = this;
    t.tmSv.loadTaskByAuthen(model).subscribe((res) => {
      if (res && res.length) {
        this.data = res[0];
        this.itemSelected = res[0][0];
        if (this.itemSelected.category == "3" || this.itemSelected.category == "4") {
          this.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskBusiness',
              'GetTaskByParentIDAsync',
              [this.itemSelected?.recID]
            )
            .subscribe((data) => {
              if (data && data.length > 0) {
                this.countOwner = data.length
                let objectId = data[0].owner;
                let objectState = data[0].status;
                for (let i = 1; i < data?.length; i++) {
                  objectId += ';' + data[i].owner;
                  objectState += ';' + data[i].status;
                }
                this.objectAssign = objectId;
                this.objectState = objectState;
              }
            });
        }
        this.isFinishLoad = true;
        if (this.itemSelected?.category != '1') {
          this.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskBusiness',
              'GetListTasksTreeAsync',
              this.itemSelected?.id
            )
            .subscribe((res) => {
              this.listNode = res;
            });
        }
      } else {
        this.data = [];
      }
      t.dt.detectChanges();
    });
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

    if (this.itemSelected.category == "3" || this.itemSelected.category == "4") {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskByParentIDAsync',
          [this.itemSelected?.recID]
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.countOwner = res.length
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
    if (this.itemSelected?.category != '1') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTasksTreeAsync',
          this.itemSelected?.id
        )
        .subscribe((res) => {
          this.listNode = res;
        });
    }
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

    } else
      this.notiService.notify('Bạn chưa được cấp quyền này !');
  }


  viewItem(taskAction) {
    this.taskInfo.openInfo(taskAction.taskID, 'view');
  }

  setupStatus(p, item) {
    p.open();
  }

  confirmDelete(e: any, t: OnwerTaskDetailsComponent) {
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
                    var taskDelete = t.data.find(x => x.taskID == lstTaskDelete[i].taskID);
                    t.listview.removeHandler(taskDelete, 'recID');
                  }
                  if (res[1] != null) {
                    var parent = t.data.find(x => x.taskID == res[1].taskID);
                    parent.assignTo = res[1].assignTo;
                    parent.category = res[1].category;
                    t.listview.addHandler(parent, false, 'recID');
                  }
                  // t.notiService.notifyCode("TM004")
                  t.notiService.notify('Xóa task thành công !');
                  t.data = t.listview.data;
                  t.itemSelected = t.data[0];
                  t.getOneItem(t.itemSelected.taskID)
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

      this.listview.addHandler(task, false, 'recID');
    }
  }

  openShowNode() {
    this.openNode = !this.openNode;
  }


  // getValueCMParameter() {
  //   const perdicate =
  //     "FieldName=@0 or FieldName=@1 or FieldName=@2 or FieldName=@3";
  //   const fieldName =
  //     "ProjectControl;LocationControl;UpdateControl;PlanControl";
  //   this.tmSv
  //     .getValueCMParameter(
  //       `FormName = 'TM_Parameters' AND (${perdicate})`,
  //       fieldName
  //     )
  //     .subscribe((result) => {
  //       this.configParam = this.mainService.convertListToObject(
  //         result as [],
  //         "fieldName",
  //         "fieldValue"
  //       );
  //     });
  // }
}
