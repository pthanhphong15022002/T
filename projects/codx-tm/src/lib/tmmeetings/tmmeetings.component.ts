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
import { CO_Resources } from '../models/CO_Meetings.model';
import { MeetingDetailComponent } from './meeting-detail/meeting-detail.component';

@Component({
  selector: 'codx-tmmeetings',
  templateUrl: './tmmeetings.component.html',
  styleUrls: ['./tmmeetings.component.css'],
})
export class TMMeetingsComponent extends UIComponent implements OnInit, AfterViewInit {
  @Input() projectID?:any;  //view meeting to sprint_details
  @Input() iterationID?:any
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  // @ViewChild('sprintsListTasks') sprintsListTasks: TemplateRef<any> | null;
  // @ViewChild('sprintsKanban') sprintsKanban: TemplateRef<any> | null;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any> | null;
  @ViewChild('itemTemplate') template!: TemplateRef<any> | null;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;

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
  dataObj :any ;

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
     // view meeting to sprint_details
     //this.iterationID ="SPR2208-0073" ;
     if (this.funcID == "TMT03011") {
      this.funcID= "TMT0501";
    };
    this.activedRouter.firstChild?.params.subscribe(
      (data) => (this.iterationID = data.id)
    );
     var dataObj = { projectID: this.projectID? this.projectID : '' ,iterationID : this.iterationID? this.iterationID: ''}
     this.dataObj = JSON.stringify(dataObj);
     //
    this.tmService.getMoreFunction(['TMT0501', null, null]).subscribe((res) => {
      if (res) {
        this.urlDetail = res[0].url;
      }
    });

    this.dataValue = this.user?.userID;
  }



  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.getParams();

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'CO';
    this.modelResource.className = 'MeetingsBusiness';
    this.modelResource.service = 'CO';
    this.modelResource.method = 'GetListMeetingsAsync';
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
        },
      },
      {
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          // panelLeftRef: this.panelLeftRef,
          template: this.cardKanban,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddMeetingsAsync';
    this.view.dataService.methodUpdate = 'UpdateMeetingsAsync';
    this.view.dataService.methodDelete = 'DeleteMeetingsAsync';
    this.dt.detectChanges();
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
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TMParameters', null, 'CalendarID']
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

  convertHtmlAgency(data: any) {
    var date = data.startDate;
    var desc = '<div class="d-flex align-items-top" >';
    var day = '';
    var toDay = '<div class="d-flex flex-column me-2" >';
    if(date){
      let date1 = new Date(date);
      let month = date1.getMonth() + 1;
      let myDay = this.addZero(date1.getDate());
      let year = date1.getFullYear();
      let day1 = date1.getDay() + 1;
      day += '<div class="text-dark fw-bolder fs-1 text " style="font-size: 50px;">' + myDay +'</div>';
      toDay += '<div class="text-dark fw-bold">'+ 'Thứ ' + day1+'</div>' +
      '<div class="fw-lighter">'+ 'Tháng ' + month+', ' +year+'</div></div>'
    }

    return desc + day + toDay + '</div>';
  }

  getResourceID(data) {
    var resources = [];
    resources = data.resources;
    var id = '';
    if(resources!=null){
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
        this.viewDetail(data);
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
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
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
            // e?.event.forEach((obj) => {
            //   this.view.dataService.update(obj).subscribe();
            // });
            this.itemSelected = e?.event;
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

  viewDetail(data) {
    this.codxService.navigate('', this.urlDetail, {meetingID: data.meetingID});
  }
}
