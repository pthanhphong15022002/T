import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
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
export class PopupAddCalendarComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  dialogAddCalendar: FormGroup;
  formModel: FormModel;
  isAfterRender: boolean = false;
  user: any;
  funcID: string;
  data: any;
  cbxName: object;

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
    this.data = dt?.data;
  }

  onInit(): void {
    this.cache.functionList('TMS021').subscribe((res) => {
      this.formModel = new FormModel();
      this.formModel = res;
      this.initForm();
    });
  }

  initForm() {
    this.tmService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogAddCalendar = res;
          this.isAfterRender = true;
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
    const { calendarName, description } = this.dialogAddCalendar.value;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'SaveCalendarAsync',
        [{ calendarName: calendarName, description: description }]
      )
      .subscribe((res) => {
        if (res) {
          this.notiService.notify('Thêm thành công');
          this.dialog.close();
        }
      });
  }
}
