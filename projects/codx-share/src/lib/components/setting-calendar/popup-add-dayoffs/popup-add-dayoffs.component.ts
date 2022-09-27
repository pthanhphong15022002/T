import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  CodxScheduleComponent,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { SettingCalendarService } from '../setting-calender.service';

@Component({
  selector: 'popup-add-dayoffs',
  templateUrl: './popup-add-dayoffs.component.html',
  styleUrls: ['./popup-add-dayoffs.component.scss'],
})
export class PopupAddDayoffsComponent extends UIComponent {
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  dialogAddDayoffs: FormGroup;
  formModel: FormModel;
  dialog!: DialogRef;
  isAdd: boolean = false;
  user: any;
  data: any;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
  }

  onInit(): void {
    this.cache.functionList('TMS021').subscribe((res) => {
      this.formModel = new FormModel();
      this.formModel = res;
      this.initForm();
    });
  }

  initForm() {
    this.settingCalendar
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogAddDayoffs = res;
          this.dialogAddDayoffs.addControl('calendarID', new FormControl(true));
          this.dialogAddDayoffs.addControl(
            'calendarDate',
            new FormControl(true)
          );
          this.dialogAddDayoffs.addControl('symbol', new FormControl(true));
          this.dialogAddDayoffs.addControl('note', new FormControl(true));

          if (this.isAdd) {
            this.dialogAddDayoffs.patchValue({
              calendarID: this.data.calendarID,
              calendarDate: new Date(),
              symbol: '',
              note: '',
            });
          } else {
            const { recID, calendarID, calendarDate, symbol, note } = this.data;
            this.dialogAddDayoffs.addControl('recID', new FormControl(true));
            this.dialogAddDayoffs.patchValue({
              recID: recID,
              calendarID: calendarID,
              calendarDate: calendarDate,
              symbol: symbol,
              note: note,
            });
          }
        }
      });
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data)) {
        if (event.data.value) {
          this.dialogAddDayoffs.patchValue({
            [event['field']]: event.data.value,
          });
        } else {
          this.dialogAddDayoffs.patchValue({
            [event['field']]: event.data.fromDate,
          });
        }
      } else this.dialogAddDayoffs.patchValue({ [event['field']]: event.data });
    }
    this.detectorRef.detectChanges();
  }

  saveCalendarDate() {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarDate,
        'SaveCalendarDateAsync',
        this.dialogAddDayoffs.value
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close();
          this.detectorRef.detectChanges();
        }
      });
    this.schedule.refresh();
  }
}
