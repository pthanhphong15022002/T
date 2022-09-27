import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { APICONSTANT } from '@shared/constant/api-const';

@Component({
  selector: 'popup-add-calendar',
  templateUrl: './popup-add-calendar.component.html',
  styleUrls: ['./popup-add-calendar.component.scss'],
})
export class PopupAddCalendarComponent extends UIComponent {
  dialog: DialogRef;
  dialogAddCalendar: FormGroup;
  formModel: FormModel;
  isAfterRender: boolean = false;
  user: any;
  funcID: string;
  calendarID: string;
  data: any;

  constructor(
    private injector: Injector,
    private tmService: CodxTMService,
    private authService: AuthStore,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.user = this.authService.get();
    this.funcID = this.router.snapshot.params['funcID'];
    this.dialog = dialog;
    const [formModel, calendarID] = dt?.data;
    this.formModel = formModel;
    this.calendarID = calendarID;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.tmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogAddCalendar = res;
          this.dialogAddCalendar.addControl(
            'calendarName',
            new FormControl(null)
          );
          this.dialogAddCalendar.addControl(
            'description',
            new FormControl(null)
          );
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      if (event?.data === Object(event?.data))
        this.dialogAddCalendar.patchValue({
          [event['field']]: event.data.value,
        });
      else this.dialogAddCalendar.patchValue({ [event['field']]: event.data });
    }
  }

  saveCalendar() {
    const { description, calendarName } = this.dialogAddCalendar.value;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'SaveCalendarAsync',
        [
          {
            calendarName: calendarName,
            description: description,
          },
        ]
      )
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS006');
          this.dialog.close();
        }
      });
  }
}
