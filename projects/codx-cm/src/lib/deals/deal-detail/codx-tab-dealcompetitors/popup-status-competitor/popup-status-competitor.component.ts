import { Component, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxCmService } from 'projects/codx-cm/src/projects';

@Component({
  selector: 'lib-popup-status-competitor',
  templateUrl: './popup-status-competitor.component.html',
  styleUrls: ['./popup-status-competitor.component.css']
})
export class PopupStatusCompetitorComponent {
  dialog: any;
  title = '';
  data: any;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }

  saveData(){
    if(this.data?.status != null && this.data?.status.trim() != ''){
      this.cmSv.updateStatusDealsCompetitorAsync(this.data).subscribe(res =>{
        if(res){
          this.dialog.close(this.data);
          this.notiService.notifyCode('SYS007');
        }else{
          this.notiService.notifyCode('SYS021');

        }
      })
    }
  }
}
