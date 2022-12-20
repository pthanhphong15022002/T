import { CodxTMService } from './../codx-tm.service';
import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddMeetingComponent } from './popup-add-meeting/popup-add-meeting.component';
import { CO_Meetings, CO_Resources } from '../models/CO_Meetings.model';
import { MeetingDetailComponent } from './meeting-detail/meeting-detail.component';
import { APICONSTANT } from '@shared/constant/api-const';
import { PopupStatusMeetingComponent } from './popup-status-meeting/popup-status-meeting.component';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { PopupTabsViewsDetailsComponent } from '../popup-tabs-views-details/popup-tabs-views-details.component';
import { PopupAddResourcesComponent } from './popup-add-resources/popup-add-resources.component';
import { PopupRescheduleMeetingComponent } from './popup-reschedule-meeting/popup-reschedule-meeting.component';
@Component({
  selector: 'codx-tmmeetings',
  templateUrl: './tmmeetings.component.html',
  styleUrls: ['./tmmeetings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TMMeetingsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() meeting = new CO_Meetings();
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
  resources: CO_Resources[] = [];
  resourceID: any;
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

  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();

    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.tmService.functionParent = this.funcID;
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.tmService.urlback = f.url;
      }
    });
    if (this.funcID == 'TMT03011') {
      this.funcID = 'TMT0501';
    }
    this.cache.moreFunction('TMMeetings', 'grvTMMeetings').subscribe((res) => {
      if (res) this.listMoreFunc = res;
    });

    this.dataValue = this.user?.userID;
    this.getParams();

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };

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

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'CO';
    this.requestSchedule.assemblyName = 'CO';
    this.requestSchedule.className = 'MeetingsBusiness';
    this.requestSchedule.method = 'GetListMeetingsAsync';
    this.requestSchedule.idField = 'meetingID';
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
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }
  //#region schedule

  fields = {
    id: 'meetingID',
    subject: { name: 'meetingName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resources: { name: 'resources' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'resourceID',
    IdField: 'resourceID',
    TextField: 'resourceName',
    Title: 'Resources',
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
    this.resourceID = '';
    resources = data.resources;
    var id = '';
    if (resources != null) {
      resources.forEach((e) => {
        id += e.resourceID + ';';
      });
    }

    if (id != '') {
      this.resourceID = id.substring(0, id.length - 1);
    }
    return this.resourceID;
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
      this.dialog = this.callfc.openSide(
        PopupAddMeetingComponent,
        ['add', this.titleAction, this.disabledProject, this.listResources],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
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
        this.dialog = this.callfc.openSide(
          PopupAddMeetingComponent,
          ['edit', this.titleAction, this.disabledProject],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
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
      this.dialog = this.callfc.openSide(
        PopupAddMeetingComponent,
        ['copy', this.titleAction, this.disabledProject, this.listResources],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
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
      var arrayResource = data?.resources;
      if (arrayResource && arrayResource.length > 0) {
        arrayResource.forEach((res) => {
          if (res.taskControl) resourceTaskControl.push(res.resourceID);
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
      dialogModel.FormModel= this.view.formModel
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
      350,
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
  // getResourecesNew(arrayResource) { 
  //   if (arrayResource?.length > 0) {
  //     var idResources = arrayResource.map((x) => {
  //       return x.resourceID;
  //     });
  //     if (!this.listResources)
  //       return this.resourcesNew.emit(idResources.join(';'));
  //     let arrResOld = this.listResources.split(';');
  //     let idNew = [];
  //     idResources.forEach((obj) => {
  //       let dt = arrResOld.find((x) => x == obj);
  //       if (dt) idNew.push(dt);
  //     });
  //     return this.resourcesNew.emit(idNew.join(';'));
  //   }
  // }
}
