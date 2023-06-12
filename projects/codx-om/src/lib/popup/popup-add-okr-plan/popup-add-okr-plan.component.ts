import { CodxOmService } from 'projects/codx-om/src/public-api';
import { OMCONST } from './../../codx-om.constant';
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
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { ɵglobal as global } from '@angular/core';

@Component({
  selector: 'popup-add-okr-plan',
  templateUrl: 'popup-add-okr-plan.component.html',
  styleUrls: ['popup-add-okr-plan.component.scss'],
})
export class PopupAddOKRPlanComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('form') form: CodxFormComponent;
  ngCmp: any = global;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  funcID: any;
  okrPlan: any;
  headerText = '';
  curOrgName = '';
  okrFG: FormGroup;
  listFG: any;
  dataOKR = [];
  owner: any;
  funcType: any;
  isAdd = false;
  curOrgID: any;
  okrFM: any;
  okrVll: any;
  groupModel: any;
  okrGrv: any;
  mssgCode: any;
  onSaving=false;
  useSKR=false;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = dialogData.data[0];
    this.okrPlan = dialogData.data[1];
    this.groupModel = { ...dialogData.data[2] };
    this.headerText = dialogData.data[3];
    this.curOrgID = dialogData.data[4];
    this.curOrgName = dialogData.data[5];
    this.okrFM = dialogData.data[6];
    this.okrVll = dialogData.data[7];
    this.funcType = dialogData.data[8];
    this.okrGrv = dialogData.data[9];
    this.useSKR = dialogData.data[10];

    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.isAdd = true;

      this.dataOKR = [];
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getCacheData();
    this.getData();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.cache.valueList('OM004').subscribe((skrGrd) => {
      if (skrGrd) {
        let x = skrGrd;
      }
    });
    this.cache.message('OM002').subscribe((mess) => {
      if (mess) {
        this.mssgCode = mess?.customName;
      }
    });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  //Lấy thông tin owner
  getData() {
    if (this.isAdd) {
      this.getOwnerInfo();
    } else {
      this.afterOpenEditForm();
    }
  }
  afterOpenEditForm() {
    this.codxOmService
      .getOKRByPlanID(this.okrPlan.recID)
      .subscribe((item: any) => {
        if (item) {
          this.dataOKR = item;
        }
        this.isAfterRender = true;
      });
  }
  getOwnerInfo() {
    this.codxOmService
      .getManagerByOrgUnitID(this.curOrgID)
      .subscribe((ownerInfo) => {
        if (ownerInfo) {
          this.owner = ownerInfo;
          this.okrPlan.owner = this.owner?.userID;
          this.okrPlan.employeeID = this.owner?.employeeID;
          this.okrPlan.orgUnitID = this.owner?.orgUnitID;
          this.okrPlan.departmentID = this.owner?.departmentID;
          this.okrPlan.companyID = this.owner?.companyID;
          this.okrPlan.positionID = this.owner?.positionID;
          this.okrPlan.divisionID = this.owner?.divisionID;
          this.okrPlan.buid = this.owner?.buid;
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(evt: any) {
    if (evt && evt?.data) {
    }
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  addOKR(type: any, obIndex: number, krIndex: number) {
    if(this.dataOKR==null){
      this.dataOKR=[];
    }
    if (type && obIndex != null && krIndex != null) {
      switch (type) {
        case this.obType:
          let tmpOB=this.createNewOKR(type)
          this.dataOKR.push(tmpOB);
          break;

        case this.krType:
          if (this.dataOKR[obIndex]?.okrName == null) {
            this.notificationsService.notifyCode(
              'OM002',
              0,
              '"' + this.okrGrv.obGrv['okrName'].headerText + '"'
            );
            return;
          }
          if (!this.dataOKR[obIndex]?.items) {
            this.dataOKR[obIndex].items = [];
          }
          this.dataOKR[obIndex]?.items.push(this.createNewOKR(type));
          break;

        case this.skrType:
          if (this.dataOKR[obIndex]?.items[krIndex]?.okrName == null) {
            this.notificationsService.notifyCode(
              'OM002',
              0,
              '"' + this.okrGrv.krGrv['okrName'].headerText + '"'
            );
            return;
          }
          if (!this.dataOKR[obIndex]?.items[krIndex]?.items) {
            this.dataOKR[obIndex].items[krIndex].items = [];
          }
          this.dataOKR[obIndex]?.items[krIndex]?.items.push(
            this.createNewOKR(type)
          );
          break;
      }

      this.detectorRef.detectChanges();
      let id = '';
      switch (type) {
        case this.obType:
          id = 'ob' + (this.dataOKR.length - 1);
          break;
        case this.krType:
          id = 'ob' + obIndex + 'kr' + (this.dataOKR[obIndex].items.length - 1);
          break;
        case this.skrType:
          id =
            'ob' +
            obIndex +
            'kr' +
            krIndex +
            'skr' +
            (this.dataOKR[obIndex].items[krIndex].items.length - 1);
          break;
      }
      let dom = document.getElementById(id);
      let curInput = this.ngCmp.ng.getComponent(dom);
      if (curInput) {
        curInput.multiSelectObj.enableEditMode = true;
      }
    }
  }
  createNewOKR(type: string) {
    let tmpOKR = null;
    switch (type) {
      case this.obType:
        tmpOKR = { ...this.groupModel.obModel };
        break;
      case this.krType:
        tmpOKR = { ...this.groupModel.krModel };
        break;
      case this.skrType:
        tmpOKR = { ...this.groupModel.skrModel };
        break;
    }
    tmpOKR.items = [];
    tmpOKR.isAdd = true;
    tmpOKR.isDeleted = false;
    tmpOKR.okrLevel = this.okrPlan.okrLevel;
    tmpOKR.periodID = this.okrPlan.periodID;
    tmpOKR.year = this.okrPlan.year;
    tmpOKR.interval = this.okrPlan.interval;
    return tmpOKR;
  }

  deleteOKR(type: any, obIndex: number, krIndex: number, skrIndex: number) {
    if (type) {
      switch (type) {
        case this.obType:

          if(this.dataOKR[obIndex].autoCreated==true){
            this.notificationsService.notify('Không thể xóa mục tiêu tự động tạo');
            return;
          }
          if(this.dataOKR[obIndex].isAdd==true){
            this.dataOKR.splice(obIndex,1);
          }
          else{
            this.dataOKR[obIndex].isDeleted = true;
          }         
          break;

        case this.krType:
          
          if(this.dataOKR[obIndex].items[krIndex].autoCreated==true){
            this.notificationsService.notify('Không thể xóa kết quả chính tự động tạo');
            return;
          }
          if(this.dataOKR[obIndex].items[krIndex].isAdd==true){
            this.dataOKR[obIndex].items.splice(krIndex,1);
          }
          else{
            this.dataOKR[obIndex].items[krIndex].isDeleted = true;
          }
          
          break;

        case this.skrType:
          if(this.dataOKR[obIndex].items[krIndex].items[skrIndex].autoCreated==true){
            this.notificationsService.notify('Không thể xóa kết quả phụ tự động tạo');
            return;
          }
          if(this.dataOKR[obIndex].items[krIndex].items[skrIndex].isAdd==true){
            this.dataOKR[obIndex].items[krIndex].items.splice(skrIndex,1);
          }
          else{
            this.dataOKR[obIndex].items[krIndex].items[skrIndex].isDeleted = true;
          }
           
          break;
      }
      this.detectorRef.detectChanges();
    }
  }

  obChange(evt: any, obIndex: number) {
    if (evt && evt?.field && evt?.data != null && obIndex != null) {
      this.dataOKR[obIndex][evt?.field] = evt?.data;
      if(evt?.field =='okrGroupID'){
        this.dataOKR[obIndex].bscType = evt?.itemData?.BSCType;
        
      }
      console.log(this.dataOKR[obIndex]);
      
      this.detectorRef.detectChanges();
    }
  }
  krChange(evt: any, obIndex: number, krIndex: number) {
    if (
      evt &&
      evt?.field &&
      evt?.data != null &&
      obIndex != null &&
      krIndex != null
    ) {
      this.dataOKR[obIndex].items[krIndex][evt?.field] = evt?.data;

      this.detectorRef.detectChanges();
    }
  }
  skrChange(evt: any, obIndex: number, krIndex: number, skrIndex: number) {
    if (
      evt &&
      evt?.field &&
      evt?.data != null &&
      obIndex != null &&
      krIndex != null &&
      skrIndex != null
    ) {
      this.dataOKR[obIndex].items[krIndex].items[skrIndex][evt?.field] =
        evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//
  inputValidate() {
    for (let ob of this.dataOKR) {
      ob.weight = 1 / this.dataOKR.length;
      if (ob.okrName == null || ob.okrName == '') {
        return this.obType;
      } else {
        for (let kr of ob.items) {
          kr.weight = 1 / ob.items.length;
          if (kr.okrName == null || kr.okrName == '') {
            return this.krType;
          } else {
            for (let skr of kr.items) {
              skr.weight = 1 / kr.items.length;
              if (skr.okrName == null || skr.okrName == '') {
                return this.skrType;
              }
            }
          }
        }
      }
    }
    return null;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func------------------------------------//
  //---------------------------------------------------------------------------------//
  onSaveForm() {
    this.onSaving=true;
    switch (this.inputValidate()) {
      case this.obType:
        this.notificationsService.notifyCode(
          'OM002',
          0,
          '"' + this.okrGrv.obGrv['okrName'].headerText + '"'
        );
        this.onSaving=false;
        return;
      case this.krType:
        this.notificationsService.notifyCode(
          'OM002',
          0,
          '"' + this.okrGrv.krGrv['okrName'].headerText + '"'
        );
        this.onSaving=false;
        return;
      case this.skrType:
        this.notificationsService.notifyCode(
          'OM002',
          0,
          '"' + this.okrGrv.skrGrv['okrName'].headerText + '"'
        );
        this.onSaving=false;
        return;
    }
    this.codxOmService
      .addEditOKRPlans(this.okrPlan, this.dataOKR, this.isAdd)
      .subscribe((res) => {
        if (res) {
          if (this.isAdd) {
            this.notificationsService.notifyCode('SYS006');
          } else {
            this.notificationsService.notifyCode('SYS007');
          }
          this.dialogRef && this.dialogRef.close(true);
        }        
        else{
          this.onSaving=false;
          return ;
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  onCreated(evt: any) {}
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
