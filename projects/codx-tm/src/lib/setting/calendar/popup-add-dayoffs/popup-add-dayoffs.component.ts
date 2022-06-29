import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'popup-add-dayoffs',
  templateUrl: './popup-add-dayoffs.component.html',
  styleUrls: ['./popup-add-dayoffs.component.scss'],
})
export class PopupAddDayoffsComponent implements OnInit, AfterViewInit {
  dialogAddDayoffs: FormGroup;
  formModel: FormModel;
  dialog!: DialogRef;
  calendateDate: any;
  evtCDDate: any;
  data:any;
  
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
  }

  ngOnInit(): void {
    console.log(this.data)
  }

  ngAfterViewInit(): void {}

  saveCalendarDate() {
    const t = this;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarDate,
        'SaveCalendarDateAsync',
        this.evtCDDate
      )
      .subscribe((res) => {
        if (res) {
          if (res.isAdd) {
            t.calendateDate.push(res.data);
          } else {
            var index = t.calendateDate.findIndex(
              (p) => p.recID == t.evtCDDate.recID
            );
            t.calendateDate[index] = t.evtCDDate;
          }
          this.dialog.close();
        }
      });
  }

  changeTime(e, entity) {
    if (e.field == 'calendarDate') this.evtCDDate.calendarDate = e.data;
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogAddDayoffs.patchValue({ [event['field']]: event.data.value });
      else this.dialogAddDayoffs.patchValue({ [event['field']]: event.data });
    }
  }
}
