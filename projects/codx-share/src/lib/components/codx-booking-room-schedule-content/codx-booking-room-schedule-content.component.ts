declare var window: any;
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CallFuncService,
  DataRequest,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewsComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
import { CodxShareService } from '../../codx-share.service';
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
  constructor(
    private injector: Injector,
    private codxShareService: CodxShareService,
    private callFuncService: CallFuncService
  ) {
    super(injector);
  }

  onInit(): void {
    this.codxShareService.getBookingByRecID(this.recID).subscribe((res) => {
      if (res) {
        this.data = res;
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
  meetingNow(url:string){
    if(url !=null){

      window.open(url, '_blank');
    }
  }
}
