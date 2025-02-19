import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
  ViewModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { OKRComponent } from '../../okr/okr.component';
import { OMCONST } from '../../codx-om.constant';

@Component({
  selector: 'popup-check-in',
  templateUrl: 'popup-check-in.component.html',
  styleUrls: ['popup-check-in.component.scss'],
})
export class PopupCheckInComponent
  extends UIComponent
  implements AfterViewInit
{
  views: Array<ViewModel> | any = [];
  @ViewChild('attachment') attachment: AttachmentComponent;
  dialogRef: DialogRef;
  headerText: string;

  oldDataKR: any;
  fCheckinKR: FormGroup;
  isAfterRender: boolean;
  dataKR: any;
  formModel = new FormModel();
  grView: any;
  okrFM: any;
  curUser: any;
  data: any;
  checkType: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private authStore: AuthStore,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.oldDataKR = dialogData.data[0];
    this.headerText = dialogData?.data[1];
    this.data = dialogData.data[2];
    this.okrFM = dialogData.data[3];
    this.checkType = dialogData.data[4];

    this.curUser = authStore.get();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.formModel.entityName = 'OM_OKRs.CheckIns';
    this.formModel.entityPer = 'OM_OKRs.CheckIns';
    this.formModel.gridViewName = 'grvOKRs.CheckIns';
    this.formModel.formName = 'OKRs.CheckIns';
    this.fCheckinKR = this.codxService.buildFormGroup(
      this.formModel.formName,
      this.formModel.gridViewName
    );

    this.getCacheData();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
          this.getCurrentKR();
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentKR() {
    this.codxOmService
      .getOKRByID(this.oldDataKR?.recID)
      .subscribe((krModel) => {
        if (krModel) {
          this.dataKR = krModel;
          if (this.checkType == OMCONST.VLL.CHECK_IN_TYPE.RealTime) {
            this.data.status = OMCONST.VLL.CHECK_IN_STATUS.RealTime;
            this.data.checkIn = new Date();
          } else if (this.checkType == OMCONST.VLL.CHECK_IN_TYPE.Review) {
            this.data.status = OMCONST.VLL.CHECK_IN_STATUS.Review;
          } else {
            this.data.status =
              new Date(this.oldDataKR?.nextCheckIn) < new Date()
                ? OMCONST.VLL.CHECK_IN_STATUS.LatePlan
                : OMCONST.VLL.CHECK_IN_STATUS.OnPlan;
          }
          this.data.createdOn = new Date();
          this.isAfterRender = true;
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(evt: any) {
    if (evt?.field && evt?.data != null) {
      this.data[evt?.field] = evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  checkinCancel() {
    this.dialogRef.close();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  checkinSave() {
    // this.fCheckinKR.patchValue(this.data);
    // if (this.fCheckinKR.invalid == true) {
    //   this.codxOmService.notifyInvalid(this.fCheckinKR, this.formModel);
    //   return;
    // }
    this.data.checkIn = this.dataKR.nextCheckIn;
    if (
      this.data?.cummulated < this.dataKR?.actual &&
      this.dataKR.checkInMode == '1'
    ) {
      this.notificationsService.notify(
        'Giá trị sau cùng không được nhỏ hơn giá trị của lần cập nhật trước đó'
      );
      return;
    }
    if (this.dataKR.checkInMode == '1') {
      this.data.value = this.data?.cummulated - this.dataKR?.actual;
    } else {
      this.data.cummulated = this.data.value + this.dataKR?.actual;
    }
    // if(this.dataKR.frequence !='D'&&this.dataKR.frequence !='M'&&this.dataKR.frequence !='W'){
    //   this.data.checkInType
    // }
    this.codxOmService
      .checkInKR(this.dataKR.recID, this.data)
      .subscribe((res: any) => {
        if (res) {
          this.notificationsService.notifyCode('SYS034');
          if (res?.status == OMCONST.VLL.CHECK_IN_STATUS.Review) {
            this.dialogRef && this.dialogRef.close(res);
          } else {
            this.codxOmService
              .calculatorProgressOfPlan([this.dataKR?.transID])
              .subscribe((listPlan: any) => {
                if (listPlan != null) {
                  this.dialogRef && this.dialogRef.close(listPlan);
                } else {
                  this.dialogRef && this.dialogRef.close(res);
                }
              });
          }
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileCount(evt: any) {}

  fileAdded(evt: any) {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
