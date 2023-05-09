import { Component, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CM_DealsCompetitors } from 'projects/codx-cm/src/lib/models/cm_model';
import { CodxCmService } from 'projects/codx-cm/src/projects';

@Component({
  selector: 'lib-popup-add-dealcompetitor',
  templateUrl: './popup-add-dealcompetitor.component.html',
  styleUrls: ['./popup-add-dealcompetitor.component.css']
})
export class PopupAddDealcompetitorComponent {
  data = new CM_DealsCompetitors();
  dialog: any;
  action = '';
  title = '';
  gridViewSetup: any;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data?.data;
    this.data.dealID = dt?.data?.dealID;
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }

  onSave(){
    if(this.data?.competitorID == null || this.data?.competitorID.trim() == ''){
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CompetitorID'].headerText + '"'
      );
      return;
    }
    this.cmSv.addDealCompetitor(this.data).subscribe(res =>{
      if(res){
        this.dialog.close(res);
        this.notiService.notifyCode('SYS006');
      }else{
        this.dialog.close();
        this.notiService.notifyCode('SYS023');
      }
    })
  }

  valueChange(e){
    if(e.data){
      this.data[e.field] = e?.data;
    }
  }
}
