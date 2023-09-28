import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  AuthService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-popup-over-time',
  templateUrl: './popup-over-time.component.html',
  styleUrls: ['./popup-over-time.component.css'],
})
export class PopupOverTimeComponent extends UIComponent {
  console = console;
  data: any;
  funcType: any;
  tmpTitle: any;
  optionalData: any;
  viewOnly = false;
  dialogRef: DialogRef;
  formModel: FormModel;
  title: string;
  grView: any;
  fromTime: string;
  toTime: string;
  @ViewChild('form') form: any;

  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authService: AuthService,
    private cacheService: CacheService,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.funcType = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    if (dialogData?.data[4] != null && dialogData?.data[4] == true) {
      this.viewOnly = true;
    }
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.funcID = this.formModel?.funcID;

    console.log(this.data);
    // this.form?.formGroup.patchValue(this.data);

    if (this.funcType != 'add') {
      let tmpStartTime = new Date(this.data?.fromTime);
      let tmpEndTime = new Date(this.data?.toTime);
      this.fromTime =
        ('0' + tmpStartTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
      this.toTime =
        ('0' + tmpEndTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
    }
  }

  getGrvSetup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
  }

  onInit(): void {}

  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }

  valueChange(e) {}

  onSaveForm() {}
}
