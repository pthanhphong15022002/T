import { CO_Meetings } from './../../models/CO_Meetings.model';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { Component, Injector, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIComponent, ViewType, AuthStore, DialogData } from 'codx-core';

@Component({
  selector: 'lib-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.css']
})
export class MeetingDetailComponent extends UIComponent implements OnDestroy {

  funcID = '';
  views = [];
  meetingID: any;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  }
  dataValue = '';
  user: any;
  iterationID= '';
  data: any ;
  month: any;
  day: any;
  startTime: any;
  meeting= new CO_Meetings()
  constructor(
    private injector: Injector,
    private TMService: CodxTMService,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    @Optional() dt?: DialogData,

  ) {
    super(injector);
    this.route.params.subscribe(params => {
      if (params)
        this.funcID = params['funcID'];
    })

    this.TMService.hideAside.next(false);

  }

  ngOnDestroy(): void {
    this.TMService.hideAside.next(true);
  }

  onInit(): void {
    this.getQueryParams();
    if(this.meetingID!=null){
      this.TMService.getMeetingID(this.meetingID).subscribe(res=>{
        if(res){
          this.data = res;
          this.meeting = this.data;
        }
      });
    }

  }

  ngAfterViewInit(): void {
    this.getDate();
  }

  getQueryParams() {
    this.route.queryParams.subscribe(params => {
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
      let start = this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end = this.addZero(endDate.getHours()) + ':' + this.addZero(endDate.getMinutes());

      this.startTime = start + ' - ' + end;
    }
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
}
