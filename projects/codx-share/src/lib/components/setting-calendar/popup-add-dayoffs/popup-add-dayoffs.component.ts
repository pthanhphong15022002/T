import {
  Component,
  EventEmitter,
  Injector,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  CodxScheduleComponent,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
  ViewsComponent,
} from 'codx-core';
import { SettingCalendarService } from '../setting-calender.service';

@Component({
  selector: 'popup-add-dayoffs',
  templateUrl: './popup-add-dayoffs.component.html',
  styleUrls: ['./popup-add-dayoffs.component.scss'],
})
export class PopupAddDayoffsComponent extends UIComponent {
  @Output('reloadCalendar') reloadCalendar: EventEmitter<any> =
    new EventEmitter();
  @ViewChild('view') viewOrg!: ViewsComponent;
  dialogAddDayoffs: FormGroup;
  dialog!: DialogRef;
  isAdd: boolean = false;
  isAfterRender = false;
  user: any;
  data: any;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService,
    private fb: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    console.log(this.data);
  }

  onInit(): void {
    this.initForm();
    this.isAfterRender = true;
  }

  initForm() {
    this.dialogAddDayoffs = this.fb.group({
      calendarID: [
        this.data.calendarID,
        Validators.compose([Validators.required]),
      ],
      calendarDate: [new Date(), Validators.compose([Validators.required])],
    });

    this.dialogAddDayoffs.addControl('dayoffColor', new FormControl(''));
    this.dialogAddDayoffs.addControl('symbol', new FormControl(''));
    this.dialogAddDayoffs.addControl('note', new FormControl(''));

    if (this.isAdd) {
      this.dialogAddDayoffs.patchValue({
        calendarID: this.data.calendarID,
        calendarDate: new Date(),
        dayoffColor: '#0078FF',
        symbol: '',
        note: '',
      });
    } else {
      this.dialogAddDayoffs.addControl('recID', new FormControl(''));
      this.dialogAddDayoffs.patchValue(this.data);
    }
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
    let isValid = this.dialogAddDayoffs.status == 'VALID' ? true : false;
    if (isValid) {
      this.settingCalendar
        .saveCalendarDate(this.dialogAddDayoffs.value)
        .subscribe((res) => {
          if (res) {
            this.dialog.close();
            this.detectorRef.detectChanges();
          }
        });
    } else {
      this.settingCalendar.notifyInvalid(this.dialogAddDayoffs);
      return;
    }
  }
}
