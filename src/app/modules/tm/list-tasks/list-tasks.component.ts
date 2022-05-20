import { ChangeDetectorRef, Component, Input, OnInit, Injector } from '@angular/core';
import { ApiHttpService, AuthStore, CallFuncService, CodxListviewComponent, NotificationsService } from 'codx-core';
import * as moment from 'moment';
import { ActionTypeOnTask } from '../models/enum/enum';
import { TmService } from '../tm.service';
import { DataRequest } from '@shared/models/data.request';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { UpdateStatusPopupComponent } from '../controls/update-status-popup/update-status-popup.component';


declare var _;


@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  @Input() data: any = [];
  @Input('viewBase') viewBase: ViewBaseComponent;
  @Input('listview') listview: CodxListviewComponent;
  @Input('taskInfo') taskInfo: TaskInfoComponent;

  model: DataRequest;
  user: any;
  i = 0;

  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  gridView: any;
  itemSelected = null;
  objectAssign: any;
  objectState: any;
  resourceViewList: any;
  columnGroupby = "createdOn";
  listNode = [];
  dataObj = { view: "listTasks", viewBoardID: "" };
  countOwner = 0;
  popoverList: any;
  popoverDetail: any;
  imployeeInfo: any = {};
  listEmpInfo = [];
  lstTaskbyParent = [];
  taskAction: any;
  constructor(private tmSv: TmService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    injector: Injector,
    //  private confirmationDialogService: ConfirmationDialogService,

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
        this.listview.addHandler(res, false, 'recID');
        this.data = this.listview.data;
        if (t.itemSelected.taskID == res.taskID) {
          t.getOneItem(this.itemSelected.taskID) ;
          t.dt.detectChanges();
        }
      }
    });
  }


  trackByFn(index: number, item): string {
    return item.taskID;
  }

  onChangeStatusTask(data) {
    if (data.actionType == ActionTypeOnTask.ChangeStatus) {
      this.tmSv.onChangeStatusTask(data.data.taskID, data.value)
    }
  }

  dropDetail(memo, memo2) {

    memo = memo ? memo : '';
    memo2 = memo2 ? memo2 : '';
    let html = '<div class="d-flex flex-column flex-grow-1">' +
      '<div class="result-title text-dark font-size-h5 mb-2">Mô tả chi tiết</div>' +
      '<div class="text-dark-75 font-size-md">' +
      memo +
      '<div class="d-flex align-items-center mt-2">' +
      '<div class="d-flex align-items-center mr-2">' +
      '<span class="icon-create icon-18 text-dark-50"></span>' +
      '<span class="text-dark-50 text-italic">' + memo2
      +
      '</span></div></div></div>';
    return html;
  }

  loadData() {
    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
   // this.model.funcID = "TM003"//this.viewBase.funcID ;
    this.model.page = 1;
    this.model.pageSize = 100;
    // model.dataValue = this.user.userID;
    // set max dinh
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate || moment("3/01/2022").toDate() }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.toDate || moment("5/31/2022").toDate() },
      ],
    };

    this.model.dataObj = "{\"view\":\"2\"}";
    const t = this;
    t.tmSv.loadTaskByAuthen(this.model).subscribe(
      (res) => {
        if (res && res.length) {
          this.data = res[0];
          this.itemSelected = res[0][0];
          this.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskBusiness',
              'GetTaskByParentIDAsync',
              [this.itemSelected?.id]
            )
            .subscribe((res) => {
              this.countOwner = res.length;
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
        t.dt.detectChanges();
      });

  }
  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null)
        p.open();
    }
    else
      p.close();
  }

  PopoverEmp(p: any, emp) {
    this.popoverList = p;
    if (emp != null) {
      this.api.callSv("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [emp.taskID]).subscribe(res => {

        if (res && res.msgBodyData[0].length > 0) {
          this.lstTaskbyParent = res.msgBodyData[0];
          console.log("data123", this.lstTaskbyParent)
          p.open();
        }
      })
    }
    // else {
    //   this.lstTaskbyParent = [];
    //   p.close();
    // }
  }
  isTooltip(el) {
    return (el.offsetWidth < el.scrollWidth);
  }

  clickItem(item) {
    this.getOneItem(item.id);
  }
  getOneItem(id) {
    var itemDefault = this.data.find((item) => item.id == id);
    if (itemDefault != null) {
      this.itemSelected = itemDefault;
    } else {
      this.itemSelected = this.data[0];
    }

    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetTaskByParentIDAsync',
        [this.itemSelected?.id]
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
    console.log(this.itemSelected);
  }

  setupStatus(p, item) {
    p.open();
  }
  viewItem(taskAction) {
    this.taskInfo.openInfo(taskAction.taskID, 'view');
  }

  showControl(p, item) {
    this.taskAction = item;
    p.open();
  }

  viewDetailTask(taskAction) {
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
    alert('copy data');
  }

  clickDelete(taskAction) {
    if (!taskAction.delete) {
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
            return that.close(e, that);
          };
        });

    } else
      this.notiService.notify('Bạn chưa được cấp quyền này !');
  }
  close(e: any, t: ListTasksComponent) {
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
                if (res) {
                  // this.notiService.notifyCode("TM004")
                  this.listview.removeHandler(this.taskAction, 'recID');
                  this.notiService.notify('Xóa task thành công !');
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
}
