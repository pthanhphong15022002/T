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
    this.loadMeeting();

  }


  getQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.meetingID = params.meetingID;
        this.dataValue = this.meetingID;
      }
    });
  }

  loadMeeting(){
    if(this.meetingID!=null){
      this.TMService.getMeetingID(this.meetingID).subscribe(res=>{
        if(res){
          this.data = res;
          this.meeting = this.data;
        }
      });
    }
  }
}
