import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
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
import { stringify } from 'querystring';

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
  statusDefault: string = '';
  status: string = '';
  statusCodecmt: string = '';
  applyFor: string = '';
  recID: string = '';
  statusOld: string;
  fieldName: string = '';
  // data:any;
  messageChangeStatus: string = '';
  // valueListStatusCode: any[] = [];
  owner: any;
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
    // // this.data = JSON.parse(JSON.stringify(dialogData?.data));
    this.owner = dialogData?.data?.owner;
    this.title = dialogData?.data?.title;
    this.gridViewSetup = dialogData?.data?.gridViewSetup;
    this.applyFor = dialogData?.data?.category;
    this.formModel = dialogData?.data?.formModel;
    this.statusOld = dialogData?.data?.statusOld;
    this.fieldName = this.getFieldName(this.applyFor);
  }
  onInit(): void {}
  ngAfterViewInit(): void {}

  cancel() {
    this.dialogRef.close();
  }
  saveForm() {
    if (this.isLockStep) return;
    if(this.applyProcess) {
      this.status = this.checkStatus(this.statusOld, this.status);
    }
    this.isLockStep = true;
    if( (this.status || this.messageChangeStatus ) && this.applyProcess ) {
      let obj = {
        statusDefault: this.statusDefault,
        statusCodecmt: this.statusCodecmt,
        status: this.status,
        message: this.messageChangeStatus,
        isOpenForm: true,
      };
      this.dialogRef.close(obj);
    }
    else {
      let datas = [
        this.recID,
        this.statusDefault,
        this.statusCodecmt,
        this.status,
      ];
      let functionCM = this.getMethod(this.applyFor);
      this.codxCmService
        .changeStatusCM(datas, functionCM?.business, functionCM?.method)
        .subscribe((res) => {
          if (res) {
            let obj = {
              statusDefault: this.statusDefault,
              statusCodecmt: this.statusCodecmt,
              status: this.status,
              message: this.messageChangeStatus,
              isOpenForm: false,
            };
            this.dialogRef.close(obj);
          }
        });
    }
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
  getMethod(applyFor) {
    let obj;
    let business;
    let method;
    if (applyFor == '1') {
      business = 'DealsBusiness';
      method = 'ChangeStatusDealAsync';
    } else if (applyFor == '2' || applyFor == '3') {
      business = 'CasesBusiness';
      method = 'ChangeStatusCasesAsync';
    }else if (applyFor == '4') {
      business = 'ContractsBusiness';
      method = 'ChangeStatusAsync';
    }
     else if (applyFor == '5') {
      business = 'LeadsBusiness';
      method = 'ChangeStatusLeadAsync';
    }
    return (obj = {
      business: business,
      method: method,
    });
  }
  checkStatus(statusOld, statusNew): string {
    if (statusNew == statusOld && statusNew) return '';
    if(this.applyFor == '5') {
      if(statusNew == '11' || statusNew == '13') {
        this.messageChangeStatus = 'Tiềm năng phải được chuyển đổi thành công cơ hội';
        return '';
      }
    }
    if (statusOld == '0') {
      if (statusNew != '0') {
        this.messageChangeStatus = 'CM058';
        return '';
      }
    } else if (statusOld == '1') {
      if (statusNew == '15' && this.owner) {
        this.messageChangeStatus = 'CM059';
        return '';
      }
      if (statusNew == '3' || statusNew == '5') {
        this.messageChangeStatus = 'CM060';
        return '';
      }
      if (statusNew == '0') {
        this.messageChangeStatus = 'CM061';
        return '';
      }
    } else if (statusOld == '2') {
      if(statusNew == '1' )  {
       // this.messageChangeStatus = 'Cơ hội đã bắt đầu ngay';
        return '1';
      }
      if (statusNew == '0') {
        this.messageChangeStatus = 'CM061';
        return '';
      }
      if (statusNew == '15' && this.owner) {
        this.messageChangeStatus = 'CM059';
        return '';
      }
    } else if (statusOld == '3' || statusOld == '5') {
      if(statusNew == '1' )  {
        //this.messageChangeStatus = 'Cơ hội đã bắt đầu ngay';
        return '1';
      }
      if (statusNew == '0') {
        this.messageChangeStatus = 'CM061';
        return '';
      }
      if (statusNew == '15' && this.owner) {
        this.messageChangeStatus = 'CM059';
        return '';
      }
      if (statusNew == '3' || statusNew == '5') {
        return '';
      }
    }
    return statusNew;
  }

  getFieldName(applyFor){
    if(applyFor == '1') return 'statusCodeID';
    return 'statusCode';
  }
}
