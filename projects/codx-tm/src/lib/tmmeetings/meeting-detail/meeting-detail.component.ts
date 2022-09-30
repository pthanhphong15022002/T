import { ViewEncapsulation } from '@angular/core';
import {
  CO_MeetingTemplates,
  CO_Content,
} from './../../models/CO_MeetingTemplates.model';
import { formatDate } from '@angular/common';
import { CO_Meetings, TabControl } from './../../models/CO_Meetings.model';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewType,
  AuthStore,
  DialogData,
  LayoutService,
  PageTitleService,
  ApiHttpService,
} from 'codx-core';

@Component({
  selector: 'lib-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MeetingDetailComponent extends UIComponent {
  funcID = '';
  views = [];
  meetingID: any;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  };
  urlDetail = '';

  dataValue = '';
  user: any;
  iterationID = '';
  data: any;
  month: any;
  day: any;
  startTime: any;
  name = 'Thảo luận';
  private all = ['Nội dung họp', 'Thảo luận', 'Giao việc'];
  startDateMeeting: any;
  endDateMeeting: any;
  userName: any;
  meeting = new CO_Meetings();
  template = new CO_MeetingTemplates();
  content1: CO_Content[] = [];
  tabControl: TabControl[] = [];
  active = 1;
  functionParent = 'TMT0501';
  listRecID = [];
  vllMeetingType = 'CO002';
  // service = 'TM';
  // entityName = 'TM_Tasks';
  // idField = 'taskID';
  // assemblyName = 'ERM.Business.TM';
  // className = 'TaskBusiness';
  // method = 'GetListTaskAssignByByMeetingAsync';
  dataObj: any;
 

  constructor(
    private injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private tmService: CodxTMService,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.getQueryParams();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe(f=>this.pageTitle.setSubTitle(f?.customName))
    this.cache.functionList(this.functionParent).subscribe((f) => {
      if (f) this.layout.setUrl(f.url);
    });
    this.layout.setLogo(null); //null tạo icon back
    this.urlDetail = 'tm/sprintdetails/TMT03011';
    this.loadData();
  }

  onInit(): void {
    this.getListComment();
  }

  ngAfterViewInit(): void {
    if (this.tabControl.length == 0) {
      this.all.forEach((res, index) => {
        var tabModel = new TabControl();
        tabModel.name = tabModel.textDefault = res;
        if (index == 1) tabModel.isActive = true;
        else tabModel.isActive = false;
        this.tabControl.push(tabModel);
      });
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabControl) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  loadData() {
    if (this.meetingID != null) {
      this.tmService.getMeetingID(this.meetingID).subscribe((res) => {
        if (res) {
          this.meeting = res;
          this.startDateMeeting = this.meeting.startDate;
          this.endDateMeeting = this.meeting.endDate;
          this.userName = this.meeting.userName;
          if (this.meeting.templateID != null) {
            this.api
              .execSv<any>(
                'CO',
                'CO',
                'MeetingTemplatesBusiness',
                'GetTemplateByMeetingAsync',
                this.meeting.templateID
              )
              .subscribe((res) => {
                if (res) {
                  this.template = res;
                  if (this.template.content) {
                    this.content1 = this.template.content;
                  }
                }
              });
          }
        }
      });
    }
  }

  getQueryParams() {
    this.route.queryParams.subscribe((params) => {
      if (params) {
        this.meetingID = params.meetingID;
        this.dataValue = this.meetingID;
      }
    });
  }

  clickMenu(item) {
    this.name = item.name;
    if (this.name == 'Giao việc') {
      this.getListRecID(this.meetingID);
    }
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    item.isActive = true;

    this.changeDetectorRef.detectChanges();
  }

  getDate(startDate, endDate) {
    if (startDate && endDate) {
      var date = new Date(startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var eDate = new Date(endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(eDate.getHours()) + ':' + this.addZero(eDate.getMinutes());
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

  convertHtmlAgency(day: any, startTime: any, userName: any) {
    var desc =
      '<div class="d-flex flex-column"><div class="d-flex align-items-center mb-1">';
    var desc2 = '';
    var desc3 = '';
    if (day) {
      day = formatDate(day, 'dd/MM/yyyy', 'en-US');
      desc +=
        ' <div class="d-flex me-4"><span class="icon-email icon-16 me-1"></span><div>' +
        day +
        '</div></div>';
      if (startTime) {
        desc2 +=
          '<div class="d-flex me-4"><span class="icon-phone_android icon-16 me-1"></span><div>' +
          startTime +
          '</div></div>';
      }
      if (userName) {
        desc3 +=
          '<div class="d-flex me-4"><span class="icon-email icon-16 me-1"></span><div>' +
          userName +
          '</div></div>';
      }
    }
    return desc + desc2 + desc3 + '</div></div>';
  }

  viewDetail(data) {
    this.codxService.navigate('', this.urlDetail, {
      meetingID: data.meetingID,
    });
  }

  lstComment: any = [];
  getListComment() {
    console.log(this.meetingID);
    // var objectID = this.meetingID;
    // this.api
    //   .execSv('BG', 'ERM.Business.BG', 'TrackLogsBusiness', 'GetHistoryByObjectIDAsync', [objectID,'C'])
    //   .subscribe((res: any[]) => {
    //     console.log(res);
    //     this.lstComment = res;
    //   });
  }

  //#region get List recID - chaỵ lại vì khi giao việc nó không cap nhật lúc đó
  getListRecID(meetingID) {
    this.tmService.getCOMeetingByID(meetingID).subscribe((res) => {
      if (res) {
        this.listRecID.push(res.recID);
        if (res.contents) {
          var contents = res.contents;
          contents.forEach((data) => {
            // if(data.recID !='')
            this.listRecID.push(data.recID);
          });
        }
        var listRecID =
          this.listRecID.length > 0 ? this.listRecID.join(';') : '';
        this.dataObj = { listRecID: listRecID };
      }
    });
  }
  //#region end
}
