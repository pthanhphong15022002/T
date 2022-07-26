import {
  ApiHttpService,
  DialogData,
  FormModel,
  DialogRef,
  UIComponent,
  AuthStore,
} from 'codx-core';
import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  Optional,
} from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import { FormGroup } from '@angular/forms';
import { CodxTMService } from '../../../codx-tm.service';

@Component({
  selector: 'popup-add-event',
  templateUrl: './popup-add-event.component.html',
  styleUrls: ['./popup-add-event.component.scss'],
})
export class PopupAddEventComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  dialogAddEvent: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  user: any;
  funcID: string;
  evtData: any;
  dayOff: any;
  set = false;
  data: any;

  constructor(
    private injector: Injector,
    private tmService: CodxTMService,
    private authService: AuthStore,
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
    console.log(this.data);
  }

  ngAfterViewInit(): void {}

  saveDayOff() {
    this.evtData.day = 1;
    this.evtData.month = 5;
    this.evtData.note = 'Quốc tế Lao động';
    let data = this.evtData;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.DaysOff,
        'SaveDayOffAsync',
        [data, this.set]
      )
      .subscribe((res) => {
        if (res) {
          if (res.isAdd) {
            this.dayOff.push(res.data);
          } else {
            this.dayOff.filter(function (o, i) {
              if (o.recID == data.recID) this.dayOff[i] = data;
            });
          }
        }
      });
    //  this.schedule.reloadDataSource();
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogAddEvent.patchValue({ [event['field']]: event.data.value });
      else this.dialogAddEvent.patchValue({ [event['field']]: event.data });
    }
  }
}
