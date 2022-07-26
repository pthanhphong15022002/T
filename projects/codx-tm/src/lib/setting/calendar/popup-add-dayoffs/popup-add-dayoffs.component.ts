import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  ApiHttpService,
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { CodxTMService } from '../../../codx-tm.service';

@Component({
  selector: 'popup-add-dayoffs',
  templateUrl: './popup-add-dayoffs.component.html',
  styleUrls: ['./popup-add-dayoffs.component.scss'],
})
export class PopupAddDayoffsComponent extends UIComponent implements OnInit {
  dialogAddDayoffs: FormGroup;
  formModel: FormModel;
  dialog!: DialogRef;
  isAfterRender: boolean = false;
  user: any;
  funcID: string;
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
          console.log(res)
          this.dialogAddDayoffs = res;
          this.isAfterRender = true;
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      if (event?.data === Object(event?.data))
        this.dialogAddDayoffs.patchValue({
          [event['field']]: event.data.value,
        });
      else this.dialogAddDayoffs.patchValue({ [event['field']]: event.data });
    }
  }

  saveCalendarDate() {
    // const t = this;
    // this.api
    //   .execSv<any>(
    //     APICONSTANT.SERVICES.BS,
    //     APICONSTANT.ASSEMBLY.BS,
    //     APICONSTANT.BUSINESS.BS.CalendarDate,
    //     'SaveCalendarDateAsync',
    //     this.evtCDDate
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       if (res.isAdd) {
    //         t.calendateDate.push(res.data);
    //       } else {
    //         var index = t.calendateDate.findIndex(
    //           (p) => p.recID == t.evtCDDate.recID
    //         );
    //         t.calendateDate[index] = t.evtCDDate;
    //       }
    //       this.dialog.close();
    //     }
    //   });
    console.log(this.dialogAddDayoffs.value)
  }
}
