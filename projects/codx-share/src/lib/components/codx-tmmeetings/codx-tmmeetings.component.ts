import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  Input,
  ViewEncapsulation,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { PopupTabsViewsDetailsComponent } from 'projects/codx-tm/src/lib/popup-tabs-views-details/popup-tabs-views-details.component';
import { CO_Meetings, CO_Permissions } from './models/CO_Meetings.model';
import { PopupAddMeetingComponent } from './popup-add-meeting/popup-add-meeting.component';
import { PopupAddResourcesComponent } from './popup-add-resources/popup-add-resources.component';
import { PopupRescheduleMeetingComponent } from './popup-reschedule-meeting/popup-reschedule-meeting.component';
import { PopupStatusMeetingComponent } from './popup-status-meeting/popup-status-meeting.component';

@Component({
  selector: 'codx-tmmeetings',
  templateUrl: './codx-tmmeetings.component.html',
  styleUrls: ['./codx-tmmeetings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTmmeetingsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  meeting = new CO_Meetings();
  @Input() funcID: string;
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  @Input() projectID?: any; //view meeting to sprint_details
  @Input() iterationID?: any;
  @Input() listResources?: string;

  // @Output() resourcesNew = new EventEmitter<string>();
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any> | null;
  @ViewChild('itemTemplate') template!: TemplateRef<any> | null;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('template7') template7: TemplateRef<any>;
  @ViewChild('cardCenter') cardCenter!: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp!: TemplateRef<any>;
  @ViewChild('mfButton') mfButton!: TemplateRef<any>;
  @ViewChild('footerNone') footerNone!: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp!: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  requestSchedule: ResourceModel;
  dialog!: DialogRef;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];
  month: any;
  day: any;
  tag = 'Tag';
  startTime: any;
  eventStatus: any;
  itemSelected: any;
  user: any;

  gridView: any;
  param: any;
  permissions: CO_Permissions[] = [];
  objectID: any;
  urlView = '';
  dataValue = '';
  formName = '';
  gridViewName = '';
  @Input() calendarID: string;
  @Input() viewPreset: string = 'weekAndDay';
  dayWeek = [];
  request: ResourceModel;
  listMoreFunc = [];
  titleAction = '';
  statusVll = 'CO004';
  toolbarCls: string;
  heightWin: any;
  widthWin: any;
  disabledProject = false;
  queryParams: any;

  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    // this.tmService
    //         .RPASendMailAlert()
    //         .subscribe();
    this.cache.moreFunction('TMMeetings', 'grvTMMeetings').subscribe((res) => {
      if (res) this.listMoreFunc = res;
    });

    this.dataValue = this.user?.userID;
    this.getParams();
    this.queryParams = this.router.snapshot.queryParams;

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    let body = document.body;
    if (body.classList.contains('toolbar-fixed'))
      this.toolbarCls = 'toolbar-fixed';

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'CO';
    this.modelResource.className = 'MeetingsBusiness';
    this.modelResource.service = 'CO';
    this.modelResource.method = 'GetListMeetingsAsync';

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.request = new ResourceModel();
    this.request.service = 'CO';
    this.request.assemblyName = 'CO';
    this.request.className = 'MeetingsBusiness';
    this.request.method = 'GetListMeetingsAsync';
    this.request.idField = 'meetingID';
    this.request.dataObj = this.dataObj;

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'CO';
    this.requestSchedule.assemblyName = 'CO';
    this.requestSchedule.className = 'MeetingsBusiness';
    this.requestSchedule.method = 'GetListMeetingsAsync';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.requestSchedule.predicate = this.queryParams?.predicate;
      this.requestSchedule.dataValue = this.queryParams?.dataValue;
    }
    this.requestSchedule.idField = 'meetingID';

    this.dataObj = JSON.stringify(this.dataObj);
    this.detectorRef.detectChanges();
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
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
        type: ViewType.calendar,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        model: {
          eventModel: this.fields,
          //resourceModel: this.resourceField,
          // template: this.eventTemplate,
          // template4: this.resourceHeader,// schenmoi can
          template6: this.mfButton, //header
          template2: this.headerTemp,
          template3: this.cellTemplate,
          template7: this.footerNone, ///footer
          template8: this.contentTmp, //content
          statusColorRef: this.statusVll,
        },
      },
      {
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          template: this.cardCenter,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddMeetingsAsync';
    this.view.dataService.methodUpdate = 'UpdateMeetingsAsync';
    this.view.dataService.methodDelete = 'DeleteMeetingsAsync';
    this.dt.detectChanges();
  }

  //#region kanban
  changeDataMF(e: any, data: any) {
    if (e) {
      e.forEach((x) => {
        // an edit và delete
        // if ((x.functionID == 'SYS02' || x.functionID == 'SYS03') && data?.createdBy != this.user?.userID  && !this.user?.administrator) {
        //   x.disabled = true;
        // }
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }

  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  //#region schedule

  fields = {
    id: 'meetingID',
    subject: { name: 'meetingName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    permissions: { name: 'permissions' },
  };
  resourceField = {
    Name: 'Permissions',
    Field: 'objectID',
    IdField: 'objectID',
    TextField: 'objectName',
    Title: 'Permissions',
  };

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
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.calendarID = param.CalendarID;
          this.getDayWeek(this.calendarID);
          this.getDayOff(this.calendarID);
          this.detectorRef.detectChanges();
        }
      });
  }

  getDayWeek(id) {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'GetDayWeekAsync',
        [id]
      )
      .subscribe((res) => {
        if (res) {
          this.dayWeek = res;
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

  convertHtmlAgency(data: any) {
    var date = data.startDate;
    var desc = '<div class="d-flex align-items-center ms-2" >';
    var day = '';
    var toDay = '<div class="d-flex flex-column me-2" >';
    if (date) {
      let date1 = new Date(date);
      let month = date1.getMonth() + 1;
      let myDay = this.addZero(date1.getDate());
      let year = date1.getFullYear();
      let day1 =
        date1.getDay() == 0 ? 'Chủ nhật' : 'Thứ ' + (date1.getDay() + 1);

      day +=
        '<div class="fs-2qx fw-bold text-gray-800 me-3 lh-1">' +
        myDay +
        '</div>';
      toDay +=
        '<div class="fs-7 text-dark fw-bold">' +
        day1 +
        '</div>' +
        '<div class="fs-8 text-gray-600">' +
        'Tháng ' +
        month +
        ', ' +
        year +
        '</div></div>';
    }

    return desc + day + toDay + '</div>';
  }

  getResourceID(data) {
    var resources = [];
    this.objectID = '';
    resources = data.permissions;
    var id = '';
    if (resources != null) {
      resources.forEach((e) => {
        id += e.objectID + ';';
      });
    }

    if (id != '') {
      this.objectID = id.substring(0, id.length - 1);
    }
    return this.objectID;
  }

  getDate(data) {
    if (data.startDate) {
      var date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());
      this.startTime = start + ' - ' + end;
    }
    return this.startTime;
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'TMT05011':
      case 'TMT05012':
        // this.viewDetail(e.data, data);
        this.viewDetail(data);
        break;
      case 'TMT05013':
        this.updateStatusMeeting(e.data, data);
        break;
      case 'TMT05014':
        this.updateTimeMeeting(data);
        break;
      case 'TMT05015':
        this.updateResources(data);
        break;
    }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      if (this.projectID) {
        this.view.dataService.dataSelected.refID = this.projectID;
        this.disabledProject = true;
      } else this.disabledProject = false;
      let obj = {
        action: 'add',
        titleAction: this.titleAction,
        disabledProject: this.disabledProject,
        listPermissions: this.listResources,
      };
      this.dialog = this.callfc.openSide(
        PopupAddMeetingComponent,
        obj,
        // ['add', this.titleAction, this.disabledProject, this.listResources],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        // if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //   );
        // if (e && e?.event != null) {
        //   this.getResourecesNew(e?.event?.resources);
        // }
      });
    });
  }
  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = 'Auto';
        if (this.projectID) {
          this.disabledProject = true;
        } else this.disabledProject = false;
        let obj = {
          action: 'edit',
          titleAction: this.titleAction,
          disabledProject: this.disabledProject,
        };
        this.dialog = this.callfc.openSide(
          PopupAddMeetingComponent,
          obj,
          // ['edit', this.titleAction, this.disabledProject],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          // if (e?.event == null)
          //   this.view.dataService.delete(
          //     [this.view.dataService.dataSelected],
          //     false
          //   );
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
      if (this.projectID) {
        this.disabledProject = true;
      } else this.disabledProject = false;
      let obj = {
        action: 'copy',
        titleAction: this.titleAction,
        disabledProject: this.disabledProject,
        listPermissions: this.listResources,
      };
      this.dialog = this.callfc.openSide(
        PopupAddMeetingComponent,
        obj,
        // ['copy', this.titleAction, this.disabledProject, this.listResources],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        // if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //   );
        // if (e && e?.event != null) {
        //   this.getResourecesNew(e?.event?.resources);
        // }
      });
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteMeetingsAsync';

    opt.data = itemSelected.meetingID;
    return true;
  }

  viewDetail(meeting) {
    this.tmService.getMeetingID(meeting.meetingID).subscribe((data) => {
      var resourceTaskControl = [];
      var arrayResource = data?.permissions;
      if (arrayResource && arrayResource.length > 0) {
        arrayResource.forEach((res) => {
          if (res.taskControl) resourceTaskControl.push(res.objectID);
        });
      }
      var resources =
        resourceTaskControl.length > 0 ? resourceTaskControl.join(';') : '';
      var dataObj = {
        projectID: this.projectID ? this.projectID : '',
        resources: resources,
        fromDate: data.fromDate ? moment(new Date(data.fromDate)) : '',
        endDate: data.toDate ? moment(new Date(data.toDate)) : '',
      };

      var obj = {
        data: data,
        dataObj: dataObj,
      };
      let dialogModel = new DialogModel();
      dialogModel.FormModel = this.view.formModel;
      dialogModel.IsFull = true;
      dialogModel.zIndex = 900;
      var dialog = this.callfc.openForm(
        PopupTabsViewsDetailsComponent,
        '',
        this.widthWin,
        this.heightWin,
        '',
        obj,
        '',
        dialogModel
      );
      dialog.beforeClose.subscribe((res) => {
        if (this.toolbarCls) document.body.classList.add(this.toolbarCls);
      });
    });
  }

  //#region hoàn thành cuộc họp
  updateStatusMeeting(moreFunc, data) {
    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
      vll: 'CO004',
    };
    this.dialog = this.callfc.openForm(
      PopupStatusMeetingComponent,
      '',
      500,
      350,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }
  //#region end

  //#region Doi lich hop, Them nguoi tham gia
  updateTimeMeeting(data) {
    var obj = {
      title: this.titleAction,
      data: data,
      funcID: this.funcID,
    };
    this.dialog = this.callfc.openForm(
      PopupRescheduleMeetingComponent,
      '',
      700,
      500,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      } else this.view.dataService.dataSelected = null;
    });
  }

  updateResources(data) {
    var obj = {
      title: this.titleAction,
      data: data,
      funcID: this.funcID,
    };
    this.dialog = this.callfc.openForm(
      PopupAddResourcesComponent,
      '',
      880,
      500,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      } else this.view.dataService.dataSelected = null;
    });
  }
  //#endregion

  //#region double click  view detail
  doubleClick(data) {
    this.viewDetail(data);
  }
  //end region

  onScroll(event) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop + dcScroll.clientHeight <
      dcScroll.scrollHeight - 150
    ) {
      return;
    }

    if (this.view.dataService.page < this.view.dataService.pageCount) {
      this.view.dataService.scrolling();
    }
  }

  onDragDrop(data: any) {
    this.api
      .execSv<any>('CO', 'CO', 'MeetingsBusiness', 'UpdateMeetingsAsync', data)
      .subscribe((res) => {
        if (res) {
          this.view.dataService.update(data).subscribe();
        }
      });
  }

  onActions(e: any) {
    switch (e.type) {
      case 'drop':
        this.onDragDrop(e.data);
        break;
      case 'dbClick':
      case 'edit':
        this.viewDetail(e?.data);
        break;
      case 'doubleClick':
        this.viewDetail(e?.data);
        break;
    }
  }

  getDayCalendar(e) {
    var current_day = e.getDay();
    switch (current_day) {
      case 0:
        current_day = 'Chủ nhật';
        break;
      case 1:
        current_day = 'Thứ hai';
        break;
      case 2:
        current_day = 'Thứ ba';
        break;
      case 3:
        current_day = 'Thứ tư';
        break;
      case 4:
        current_day = 'Thứ năm';
        break;
      case 5:
        current_day = 'Thứ sáu';
        break;
      case 6:
        current_day = 'Thứ bảy';
        break;
    }

    return current_day;
  }
  openLinkMeeting(data) {
    window.open(data?.link);
  }
}
