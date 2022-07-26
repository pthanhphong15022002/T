import {
  Component,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Injector,
  Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  ViewModel,
  ViewType,
  RequestOption,
  ButtonModel,
  ResourceModel,
  SidebarModel,
  DialogRef,
  AuthStore,
  UrlUtil,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import * as moment from 'moment';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { isBuffer } from 'util';
import { CodxTMService } from '../codx-tm.service';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { PopupViewTaskResourceComponent } from './popup-view-task-resource/popup-view-task-resource.component';
import { UpdateStatusPopupComponent } from './update-status-popup/update-status-popup.component';
@Component({
  selector: 'test-views',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent extends UIComponent {
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  @ViewChild('eventModel') eventModel?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('treeView') treeView: TemplateRef<any>;

  // @ViewChild("schedule") schedule: CodxScheduleComponent;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  model?: DataRequest;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resourceTree: ResourceModel;
  dialog!: DialogRef;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];
  // resourceField: any;
  eventStatus: any;
  itemSelected: any;
  user: any;
  funcID: string;
  gridView: any;
  isAssignTask = false;
  param: any;
  dataObj: any;
  iterationID: string = '';
  listTaskResousce = [];
  searchField = '';
  listTaskResousceSearch = [];
  listRoles = [];
  vllRole = 'TM002';
  countResource = 0;
  popoverCrr: any;
  popoverDataSelected: any;
  vllStatusTasks ='TM004'
  vllStatusAssignTasks ='TM007'
  @Input() calendarID: string;
  @Input() viewPreset: string = 'weekAndDay';

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.activedRouter.firstChild?.params.subscribe(
      (data) => (this.iterationID = data.id)
    );
    var dataObj = { view: '', calendarID: '', viewBoardID: this.iterationID };
    this.dataObj = JSON.stringify(dataObj);
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'copy':
        this.copy(data);
        break;
      case 'delete':
        this.delete(data);
        break;
      case 'sendemail':
        this.sendemail(data);
        break;
      case 'TMT02015': // cái này phải xem lại , nên có biến gì đó để xét
        this.assignTask(data);
        break;
      case 'SYS001': // cái này phải xem lại , nên có biến gì đó để xét
        //Chung làm
        break;
      case 'SYS002': // cái này phải xem lại , nên có biến gì đó để xét
        //Chung làm
        break;
      case 'SYS003': // cái này phải xem lại , nên có biến gì đó để xét
        //???? chắc làm sau ??
        break;
      default:
        this.changeStatusTask(e, data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  onInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'TM';
    this.modelResource.className = 'TaskBusiness';
    this.modelResource.service = 'TM';
    this.modelResource.method = 'GetUserByTasksAsync';

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'TM';
    this.resourceKanban.assemblyName = 'TM';
    this.resourceKanban.className = 'TaskBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    // this.resourceTree = new ResourceModel();
    // this.resourceTree.assemblyName = 'TM';
    // this.resourceTree.className = 'TaskBusiness';
    // this.resourceTree.service = 'TM';
    // this.resourceTree.method = 'GetListTasksTreeAsync';

    this.button = {
      id: 'btnAdd',
    };
    this.getParams();
  }

  change() {
    this.view.dataService.setPredicates(['Status=@0'], ['1']);
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: true,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: true,
        request2: this.modelResource,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template: this.eventTemplate,
          template3: this.cellTemplate,
        },
      },
      {
        type: ViewType.treedetail,
        active: false,
        sameData: true,
        // request2: this.resourceTree,
        model: {
          template: this.treeView,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddTaskAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskAsync';
    this.view.dataService.methodDelete = 'DeleteTaskAsync';
    this.getParam();
    this.detectorRef.detectChanges();
  }
  //#region schedule

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'userID' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    console.log(evt);
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate, logic: 'and' },
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
      ],
    };
  }

  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
          }
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
        }
      }
    }

    return ``;
  }

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TM_Parameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.calendarID = res.fieldValue;
          this.getDayOff(this.calendarID);
        }
      });
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          res.forEach((ele) => {
            this.dayoff = res;
          });
        }
      });
  }
  //#endregion schedule

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'add', this.isAssignTask],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          this.view.dataService.data = e?.event.concat(
            this.view.dataService.data
          );
          this.view.dataService.setDataSelected(res[0]);
          this.view.dataService.afterSave.next(res);
          this.notiService.notifyCode('TM005');
          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      });
    });
  }

  edit(data?) {
    if (data && data.status >= 8) {
      this.notiService.notifyCode('TM007');
      return;
    }
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopupAddComponent,
          [this.view.dataService.dataSelected, 'edit', this.isAssignTask],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e?.event && e?.event != null) {
            e?.event.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
            });
            this.itemSelected = e?.event[0];
          }
          this.detectorRef.detectChanges();
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'copy', this.isAssignTask, data],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          this.view.dataService.data = e?.event.concat(
            this.view.dataService.data
          );
          this.view.dataService.setDataSelected(res[0]);
          this.view.dataService.afterSave.next(res);
          this.notiService.notifyCode('TM005');

          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      });
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    if (data.status == 9) {
      this.notiService.notifyCode('TM001');
      return;
    }
    var isCanDelete = true;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskChildDetailAsync',
        data.taskID
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
            this.notiService.notifyCode('TM001');
          } else {
            this.notiService.alertCode('TM003').subscribe((confirm) => {
              if (confirm?.event && confirm?.event?.status == 'Y') {
                this.tmSv.deleteTask(data.taskID).subscribe((res) => {
                  if (res) {
                    var listTaskDelete = res[0];
                    var parent = res[1];
                    listTaskDelete.forEach((x) => {
                      this.view.dataService.remove(x).subscribe();
                    });
                    this.notiService.notify('Xóa công việc thành công !');
                    //  this.notiService.notifyCode('cần code');
                    if (parent) {
                      this.view.dataService.update(parent).subscribe();
                    }
                    this.itemSelected = this.view.dataService.data[0];
                    this.detectorRef.detectChanges();
                  }
                });
              }
            });
          }
        }
      });
  }
  //#endregion

  sendemail(data) {}

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteTaskAsync';
    opt.data = this.itemSelected.taskID;
    return true;
  }

  assignTask(data) {
    this.view.dataService.dataSelected = data;
    var vllControlShare = 'TM003';
    var vllRose = 'TM001';
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '800px';
    this.dialog = this.callfc.openSide(
      AssignInfoComponent,
      [this.view.dataService.dataSelected, vllControlShare, vllRose],
      option
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event == null)
        this.view.dataService.delete(
          [this.view.dataService.dataSelected],
          false
        );
      if (e?.event && e?.event != null) {
        let listTask = e?.event;
        let newTasks = [];
        for (var i = 0; i < listTask.length; i++) {
          if (listTask[i].taskID == data.taskID) {
            this.view.dataService.update(listTask[i]).subscribe();
            this.view.dataService.setDataSelected(e?.event[0]);
          } else newTasks.push(listTask[i]);
        }
        if (newTasks.length > 0) {
          this.view.dataService.data = newTasks.concat(
            this.dialog.dataService.data
          );
          this.view.dataService.afterSave.next(newTasks);
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  changeView(evt: any) {}

  requestEnded(evt: any) {
    if (evt.type == 'read') {
      console.log(this.view.dataService.data);
    }
    this.view.currentView;
  }
  onDragDrop(e: any) {
    if (e.type == 'drop') {
      this.api
        .execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', e.data)
        .subscribe((res) => {
          if (res) {
            this.view.dataService.update(e.data);
          }
        });
    }
  }
  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }

  changeStatusTask(moreFunc, taskAction) {
    const fieldName = 'UpdateControl';
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'TM_Parameters'
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          var fieldValue = param[fieldName];
          if (fieldValue != '0') {
            this.openPopupUpdateStatus(fieldValue, moreFunc, taskAction);
          } else {
            var completedOn = moment(new Date()).toDate();
            var completed = '0';
            if (taskAction.estimated > 0) {
              completed = taskAction.estimated;
            } else {
              var timeStart = moment(
                new Date(
                  taskAction.startOn
                    ? taskAction.startOn
                    : taskAction.startDate
                    ? taskAction.startDate
                    : taskAction.createdOn
                )
              ).toDate();
              var time = (
                (completedOn.getTime() - timeStart.getTime()) /
                3600000
              ).toFixed(2);
              completed = Number.parseFloat(time).toFixed(2);
            }

            var status = UrlUtil.getUrl('defaultValue', moreFunc.url);

            this.tmSv
              .setStatusTask(
                this.funcID,
                taskAction.taskID,
                status,
                completedOn,
                completed,
                ''
              )
              .subscribe((res) => {
                if (res && res.length > 0) {
                  res.forEach((obj) => {
                    this.view.dataService.update(obj).subscribe();
                  });
                  this.itemSelected = res[0];
                  this.detectorRef.detectChanges();
                  this.notiService.notifyCode('tm009');
                } else {
                  this.notiService.notifyCode('tm008');
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
      funcID: this.funcID,
    };
    this.dialog = this.callfc.openForm(
      UpdateStatusPopupComponent,
      'Cập nhật tình trạng',
      500,
      350,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
      }
      this.detectorRef.detectChanges();
    });
  }
  receiveMF(e: any) {
    this.clickMF(e.e, this.itemSelected);
  }

  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'TM_Parameters'
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          return callback && callback(true);
        }
      });
  }

  openViewListTaskResource(data) {
    this.dialog = this.callfc.openForm(
      PopupViewTaskResourceComponent,
      '',
      400,
      500,
      '',
      [data, this.funcID]
    );
  }

  popoverEmpList(p: any, task) {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        task.taskID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResousce = res;
          this.listTaskResousceSearch = res;
          this.countResource = res.length;
          p.open();
          this.popoverCrr = p;
          // this.titlePopover =
          //   'Danh sách được phân công (' + this.countResource + ')';
        }
      });
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }

  hoverPopover(p:any){
    this.popoverDataSelected = p
  }
}
