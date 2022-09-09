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
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddMeetingComponent } from './popup-add-meeting/popup-add-meeting.component';
import { CO_Meetings, CO_Resources } from '../models/CO_Meetings.model';
import { MeetingDetailComponent } from './meeting-detail/meeting-detail.component';
import { APICONSTANT } from '@shared/constant/api-const';
import { PopupStatusMeetingComponent } from './popup-status-meeting/popup-status-meeting.component';
@Component({
  selector: 'codx-tmmeetings',
  templateUrl: './tmmeetings.component.html',
  styleUrls: ['./tmmeetings.component.scss'],
})
export class TMMeetingsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() meeting = new CO_Meetings();

  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  @Input() projectID?: any; //view meeting to sprint_details
  @Input() iterationID?: any;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any> | null;
  @ViewChild('itemTemplate') template!: TemplateRef<any> | null;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('template7') template7: TemplateRef<any>;
  @ViewChild('cardCenter') cardCenter!: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
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
  funcID: string;
  gridView: any;
  param: any;
  resources: CO_Resources[] = [];
  resourceID: any;
  urlView = '';
  urlDetail = '';
  dataValue = '';
  formName = '';
  gridViewName = '';
  @Input() calendarID: string;
  @Input() viewPreset: string = 'weekAndDay';
  dayWeek = [];
  request: ResourceModel;

  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
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

    // this.tmService.getMoreFunction(['TMT0501', null, null]).subscribe((res) => {
    //   if (res) {
    //     this.urlDetail = res[0].url;
    //   }
    // });

    this.urlDetail = 'tm/meetingdetails/TMT05011';

    this.dataValue = this.user?.userID;
    this.getParams();
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };

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
        sameData: true,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template: this.eventTemplate,
          template3: this.cellTemplate,
          template7: this.template7,
        },
      },
      {
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          // panelLeftRef: this.panelLeftRef,
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
    // console.log(e, data);
  }
  //#end region

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
    console.log(evt);
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
        APICONSTANT.SERVICES.SYS,
        APICONSTANT.ASSEMBLY.CM,
        APICONSTANT.BUSINESS.CM.Parameters,
        'GetOneField',
        ['TMParameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.param = res;
          this.calendarID = res.fieldValue;
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
    var desc = '<div class="d-flex align-items-center ms-1" >';
    var day = '';
    var toDay = '<div class="d-flex flex-column me-2" >';
    if (date) {
      let date1 = new Date(date);
      let month = date1.getMonth() + 1;
      let myDay = this.addZero(date1.getDate());
      let year = date1.getFullYear();
      let day1 = date1.getDay() + 1;
      day +=
        '<div class="fs-2hx fw-bold text-gray-800 me-2 lh-1">' +
        myDay +
        '</div>';
      toDay +=
        '<div class="text-dark fw-bold">' +
        'Thứ ' +
        day1 +
        '</div>' +
        '<div class="fw-lighter">' +
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
        this.viewDetail(e.data, data);
        break;
      case 'TMT05013':
        this.updateStatusMeeting(e.data, data);
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

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopupAddMeetingComponent,
        'add',
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          var objectData = this.view.dataService.data;
          var object = {};
          for (var i = 0; i < objectData.length; i++) {
            if (objectData[i][i] !== undefined) {
              object[i] = objectData[i][i];
              objectData[i] = object[i];
            }
          }
          this.view.dataService.data = e?.event.concat(objectData);
          this.meeting = objectData[0];
          this.detectorRef.detectChanges();
        }
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
        this.dialog = this.callfc.openSide(
          PopupAddMeetingComponent,
          'edit',
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
            this.meeting = e?.event;
          }
          this.detectorRef.detectChanges();
        });
      });
  }
  copy(data) {}
  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteMeetingsAsync';

    opt.data = itemSelected.meetingID;
    return true;
  }

  viewDetail(func, data) {
    this.codxService.navigate('', func.url, {
      meetingID: data.meetingID,
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
}
