import { CO_MeetingTemplates, CO_Content } from './../../models/CO_MeetingTemplates.model';
import { formatDate } from '@angular/common';
import { CO_Meetings } from './../../models/CO_Meetings.model';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIComponent, ViewType, AuthStore, DialogData } from 'codx-core';

@Component({
  selector: 'lib-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.css'],
})
export class MeetingDetailComponent extends UIComponent implements OnDestroy {
  funcID = '';
  views = [];
  meetingID: any;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  };
  dataValue = '';
  user: any;
  iterationID = '';
  data: any;
  month: any;
  day: any;
  startTime: any;
  meeting = new CO_Meetings();
  template = new CO_MeetingTemplates();
  content1 : CO_Content[] = [];
  constructor(
    private injector: Injector,
    private TMService: CodxTMService,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });

    this.TMService.hideAside.next(false);
  }

  ngOnDestroy(): void {
    this.TMService.hideAside.next(true);
  }

  onInit(): void {
    this.getQueryParams();
    if (this.meetingID != null) {
      this.TMService.getMeetingID(this.meetingID).subscribe((res) => {
        if (res) {
          this.data = res;
          this.meeting = this.data;
          if(this.meeting.templateID !=null){
            this.api.execSv<any>('CO','CO','MeetingTemplatesBusiness','GetTemplateByMeetingAsync',this.meeting.templateID).subscribe(res=>{
              if(res){
                this.template = res;
                if(this.template.content){
                  this.content1 = this.template.content;
                }
              }
            })
          }
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.getDate();
  }

  getQueryParams() {
    this.route.queryParams.subscribe((params) => {
      if (params) {
        this.meetingID = params.meetingID;
        this.dataValue = this.meetingID;
      }
    });
  }

  getDate() {
    if (this.meeting.startDate) {
      var date = new Date(this.meeting.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(this.meeting.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());

      this.startTime = start + ' - ' + end;
    }
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  convertHtmlAgency(day: any, startTime: any, userName: any) {
    var desc = '<div class="d-flex flex-column"><div class="d-flex align-items-center mb-1">';
    if (day && startTime && userName) {
      day = new Date(day).toLocaleDateString('en-GB')
      desc +=
        ' <div class="d-flex me-4"><span class="icon-email icon-16 me-1"></span><div>' +
        day +
        '</div></div>' +
        '<div class="d-flex me-4"><span class="icon-phone_android icon-16 me-1"></span><div>' +
        startTime +
        '</div></div>' +
        '<div class="d-flex me-4"><span class="icon-email icon-16 me-1"></span><div>' +
        userName +
        '</div></div>';
    }
    return desc + '</div></div>';
  }
}
