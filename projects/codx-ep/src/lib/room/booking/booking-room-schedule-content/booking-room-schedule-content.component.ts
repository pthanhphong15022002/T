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
import { CodxEpService } from '../../../codx-ep.service';
import { BookingRoomComponent } from '../booking-room.component';
import { PopupAddBookingRoomComponent } from '../popup-add-booking-room/popup-add-booking-room.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
@Component({
  selector: 'booking-room-schedule-content',
  templateUrl: 'booking-room-schedule-content.component.html',
  styleUrls: ['booking-room-schedule-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BookingRoomScheduleContentComponent
  extends UIComponent
  implements AfterViewInit
{
  @Input() recID: any;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService
  ) {
    super(injector);
  }

  onInit(): void {
    this.codxEpService.getBookingByRecID(this.recID).subscribe((data) => {
      if (data) {
        let x = data;
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
}
