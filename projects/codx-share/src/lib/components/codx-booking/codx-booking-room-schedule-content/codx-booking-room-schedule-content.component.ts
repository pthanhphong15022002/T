declare var window: any;
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  AuthStore,
  CallFuncService,
  UIComponent,
} from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';
@Component({
  selector: 'codx-booking-room-schedule-content',
  templateUrl: 'codx-booking-room-schedule-content.component.html',
  styleUrls: ['codx-booking-room-schedule-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxBookingRoomScheduleContentComponent
  extends UIComponent
  implements AfterViewInit
{
  @Input() recID: any;
  data:any;
  curUser: import("codx-core").UserModel;
  haveFile = false;
  constructor(
    private injector: Injector,
    private codxShareService: CodxShareService,
    private callFuncService: CallFuncService,
    private authService: AuthService,
    private authStore: AuthStore,
  ) {
    super(injector);
    this.curUser =this.authStore.get();
    if(this.curUser==null){
      this.curUser= this.authService?.userValue;
    }
  }

  onInit(): void {
    this.codxShareService.getBookingByRecID(this.recID).subscribe((res) => {
      if (res) {
        this.data = res;
      }
    });
      this.api
      .execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [this.recID])
      .subscribe((res:any[]) => {
          if(res?.length>0){
            this.haveFile = true;
          }
      });
  
  }
  ngAfterViewInit(): void {}

  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  meetingNow(){
    if(this.data?.onlineUrl !=null){
      let url = this.curUser?.userID == this.data?.createdBy || this.curUser?.userID == this.data?.owner ? this.data?.onlineUrl2 :this.data?.onlineUrl;
      window.open(url, '_blank');
    }
  }
}
