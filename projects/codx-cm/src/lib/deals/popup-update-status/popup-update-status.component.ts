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
  status:string = '';
  statusCodecmt: string = '';
  applyFor: string = '';
  recID: string = '';
  statusOld: string;
  data:any;
  messageChangeStatus:string = '';
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
    this.applyProcess = dialogData?.data?.applyProcess;
    this.statusDefault = dialogData?.data?.statusDefault;
    this.statusCodecmt = dialogData?.data?.statusCodecmt;
    this.recID = dialogData?.data.recID;
    this.data = dialogData?.data;
    this.title =  dialogData?.data?.title;
    this.valueListStatusCode = dialogData?.data.valueListStatusCode;
    this.gridViewSetup = dialogData?.data?.gridViewSetup;
    this.applyFor = dialogData?.data?.category;
    this.formModel = dialogData?.data?.formModel;
    this.statusOld = dialogData?.data?.statusOld;
  }

  ngAfterViewInit(): void {}

  onInit(): void {}

  cancel() {
    this.dialogRef.close();
  }
  saveForm() {
    if(this.applyFor == '1' && this.applyProcess) {
      this.status =  this.checkStatus(this.statusOld, this.status);
    }

    if(this.isLockStep) return;
    this.isLockStep = true;
    let datas = [this.recID, this.statusDefault, this.statusCodecmt, this.status];
    let functionCM = this.getMethod(this.applyFor);
    this.codxCmService.changeStatusCM(datas,functionCM.business,functionCM.method).subscribe((res) => {
      if (res) {
        let obj = {
          statusDefault: this.statusDefault,
          statusCodecmt: this.statusCodecmt,
          status:this.status,
          message: this.messageChangeStatus
        }
        this.dialogRef.close(obj);
      }
    });


  }
  valueChangeStatusCode($event) {
    if ($event) {
      this.status = $event.component?.itemsSelected[0]?.ObjectStatus;
      this.statusDefault = $event?.data;
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
  getMethod(applyFor){
    let obj;
    let business;
    let method;
    if(applyFor == '1') {
      business = 'DealsBusiness';
      method ='ChangeStatusDealAsync';
    }
    else if(applyFor == '2' ||applyFor == '3'  ) {
      business = 'CasesBusiness';
      method ='ChangeStatusCasesAsync';
    }
    else if(applyFor == '5'  ) {
      business = 'LeadsBusiness';
      method ='ChangeStatusLeadAsync';
    }
    return obj = {
      business: business,
      method:method
    };
  }
  checkStatus(statusOld, statusNew): string {
    if(statusNew == statusOld && statusNew  ) return '';
    if(statusOld == '0') {
      if(statusNew != '0') {
        this.messageChangeStatus = 'CM058';
        return '';
      }
    }
    else if(statusOld == '1') {
      if(statusNew == '15' && this.data?.owner)  {
        this.messageChangeStatus = 'CM059';
        return '';
      }
      if(statusNew == '3' || statusNew == '5'  )  {
        this.messageChangeStatus = 'CM060';
        return '';
      }
      if(statusNew == '0' )  {
        this.messageChangeStatus = 'CM061';
        return '';
      }
    }
    else if(statusOld == '2') {
      if(statusNew == '1' )  {
        this.messageChangeStatus = 'Cơ hội đã bắt đầu ngay';
        return '';
      }
      if(statusNew == '0' )  {
        this.messageChangeStatus = 'CM061';
        return '';
      }
      if(statusNew == '15' && this.data?.owner)  {
        this.messageChangeStatus = 'CM059';
        return '';
      }
    }
    else if(statusOld == '3' || statusOld == '5' ) {
      if(statusNew == '1' )  {
        this.messageChangeStatus = 'Cơ hội đã bắt đầu ngay';
        return '';
      }
      if(statusNew == '0' )  {
        this.messageChangeStatus = 'CM061';
        return '';
      }
      if(statusNew == '15' && this.data?.owner)  {
        this.messageChangeStatus = 'CM059';
        return '';
      }
      if(statusNew == '3' || statusNew == '5'  )  {
        return '';
      }
    }
    return statusNew;
  }
}
