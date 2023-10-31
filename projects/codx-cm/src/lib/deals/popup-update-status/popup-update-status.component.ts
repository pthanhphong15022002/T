import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-update-status',
  templateUrl: './popup-update-status.component.html',
  styleUrls: ['./popup-update-status.component.css'],
})
export class PopupUpdateStatusComponent
  extends UIComponent
  implements AfterViewInit
{
  dialogRef: DialogRef;
  formModel: FormModel;
  title: string = '';
  gridViewSetup: any;

  applyProcess: boolean = false;
  isLockStep: boolean = false;

  @ViewChild('form') form: CodxFormComponent;
  statusDefault:string = '';
  statusCodecmt: string = '';
  recID: string = '';
  data:any;
  valueListStatusCode:any[] =[];

  readonly fieldCbxStatusCode = { text: 'text', value: 'value' };
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private codxCmService: CodxCmService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.applyProcess = dialogData?.data.applyProcess;
    this.statusDefault = dialogData?.data.statusDefault;
    this.statusCodecmt = dialogData?.data.statusCodecmt;
    this.recID = dialogData?.data.recID;
    this.data = dialogData?.data;
    this.title =  dialogData?.data.title;
    this.valueListStatusCode = dialogData?.data.valueListStatusCode;
    this.gridViewSetup = dialogData?.data.gridViewSetup;
  }

  ngAfterViewInit(): void {}

  onInit(): void {}

  cancel() {
    this.dialogRef.close();
  }
  saveForm() {
    if(this.isLockStep) return;
    this.isLockStep = true;
    let datas = [this.recID, this.statusDefault, this.statusCodecmt];
    this.codxCmService.changeStatusDeal(datas).subscribe((res) => {
      if (res) {
        let obj = {
          statusDefault: this.statusDefault,
          statusCodecmt: this.statusCodecmt,
        }
        this.dialogRef.close(obj);
      }
    });

  }
  valueChangeStatusCode($event) {
    if ($event) {
      this.statusDefault = $event;
    } else {
      this.statusDefault = null;
    }
  }
  valueChange($event) {
    if ($event) {
      this.statusCodecmt = $event.data.trim();
    } else {
      this.statusCodecmt = null;
    }
  }
}
