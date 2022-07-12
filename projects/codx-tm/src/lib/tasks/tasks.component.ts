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
  DataRequest, ViewModel, ViewType, RequestOption, ButtonModel, ResourceModel, SidebarModel, DialogRef, AuthStore, UrlUtil, NotificationsService, UIComponent,
} from 'codx-core';
import * as moment from 'moment';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxTMService } from '../codx-tm.service';
import { PopupAddComponent } from './popup-add/popup-add.component';
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

  // @ViewChild("schedule") schedule: CodxScheduleComponent;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
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
  @Input() calendarID: string;

  @Input() viewPreset: string = 'weekAndDay';

  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user.userID;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.funcID == 'TMT0203') this.isAssignTask = true; //cai này để phân biệt owner và assign mà chưa có field phân biệt cố định nên tạm làm vậy, càn xử lý !
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
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
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
    ];

    this.view.dataService.methodSave = 'AddTaskAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskAsync';
    this.view.dataService.methodDelete = 'DeleteTaskAsync';
    this.dt.detectChanges();
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

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'add', this.isAssignTask],
        option
      );
      this.dialog.closed.subscribe((e) => {
        this.itemSelected = this.view.dataService.data[0];
      });
    });
  }

  edit(data?) {
    if (data && data.status >= 8) {
      // this.notiService.notifyCode('cần code đoạn nay');
      this.notiService.notify('Không cho phép chỉnh sửa ! Công việc đang làm đã bị "Hủy" hoặc đã "Hoàn Thành"');
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
        option.Width = '800px';
        this.dialog = this.callfc.openSide(
          PopupAddComponent,
          [this.view.dataService.dataSelected, 'edit', this.isAssignTask],
          option
        );
        this.dialog.closed.subscribe((e) => {
          this.itemSelected = this.view.dataService.dataSelected;
        });
      });
  }

  copy(data) {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'copy', this.isAssignTask, data],
        option
      );
      this.dialog.closed.subscribe((e) => {
        this.itemSelected = this.view.dataService.data[0];
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
           /*  this.view.dataService
              .delete([this.view.dataService.dataSelected], true, (opt) =>
                this.beforeDel(opt)
              )
              .subscribe((res) => {
                if (res[0]) {
                  this.itemSelected = this.view.dataService.data[0];
                  this.notiService.notifyCode('TM004');
                }
              }); */
          }
        }
      });
  }

  sendemail(data) { }

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteTaskAsync';
    opt.data = this.itemSelected.taskID;
    return true;
  }

  assignTask(data) {
    this.view.dataService.dataSelected = data;
    let option = new SidebarModel();
    option.DataService = this.view?.currentView?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    option.Width = '800px';
    this.dialog = this.callfc.openSide(
      AssignInfoComponent,
      this.view.dataService.dataSelected,
      option
    );
    this.dialog.closed.subscribe((e) => {
      console.log(e);
    });
  }

  changeView(evt: any) { }

  requestEnded(evt: any) {
    //this.dialog && this.dialog.close(); sai vẫn bị đóng
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
    this.dt.detectChanges();
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
            var startDate = moment(new Date(taskAction.startDate)).toDate();
            var estimated = moment(completedOn).diff(
              moment(startDate),
              'hours'
            );
            var status = UrlUtil.getUrl('defaultValue', moreFunc.url);

            this.tmSv
              .setStatusTask(
                this.funcID,
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
                  this.view.dataService.update(taskAction).subscribe();
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
    this.dialog = this.callfc.openForm(
      UpdateStatusPopupComponent,
      'Cập nhật tình trạng',
      500,
      350,
      '',
      obj
    )
  }
  receiveMF(e: any) {
    this.clickMF(e.e, this.itemSelected);
  }
}
