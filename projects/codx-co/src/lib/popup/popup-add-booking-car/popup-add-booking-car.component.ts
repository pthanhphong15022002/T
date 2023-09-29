import { AfterViewInit, Component, Injector, Optional } from '@angular/core';
import {
  CRUDService,
  DataService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';

@Component({
  selector: 'co-popup-add-booking-car',
  templateUrl: './popup-add-booking-car.component.html',
  styleUrls: ['./popup-add-booking-car.component.scss'],
})
export class COPopupAddBookingCarComponent
  extends UIComponent
  implements AfterViewInit
{
  title: string = '';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Người đi cùng',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  formModel: FormModel;
  grView: any;
  dialogRef: DialogRef;
  onSaving = false;
  data: any;

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  onInit(): void {
    this.getCacheData();
  }

  ngAfterViewInit(): void {}

  getCacheData() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
  }

  setTitle(e) {}

  //Validation
  startDateChange(evt: any) {
    if (!evt.field) {
      return;
    }
    this.data.startDate = new Date(evt.data.fromDate);

    this.detectorRef.detectChanges();
  }
  
  endDateChange(evt: any) {
    if (!evt.field) {
      return;
    }
    this.data.endDate = new Date(evt.data.fromDate);
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    let isAdd = true;
    option.methodName = 'SaveAsync';
    option.data = [];
    return true;
  }

  onSaveForm() {
    (this.dialogRef.dataService as CRUDService)
      .save((opt: any) => this.beforeSave(opt), 0, null, null, false)
      .subscribe((res: any) => {
        if (res.save || res.update) {
        } else {
          this.onSaving = false;
          return;
        }
      });
  }
}
