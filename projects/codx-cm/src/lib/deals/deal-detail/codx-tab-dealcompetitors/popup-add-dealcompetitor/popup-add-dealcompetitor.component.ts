import { Component, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxCmService } from 'projects/codx-cm/src/projects';

@Component({
  selector: 'lib-popup-add-dealcompetitor',
  templateUrl: './popup-add-dealcompetitor.component.html',
  styleUrls: ['./popup-add-dealcompetitor.component.css']
})
export class PopupAddDealcompetitorComponent {
  data: any;
  dialog: any;
  action = '';
  title = '';
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.action = dt?.data?.action;
  }

  onSave(){
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
}
