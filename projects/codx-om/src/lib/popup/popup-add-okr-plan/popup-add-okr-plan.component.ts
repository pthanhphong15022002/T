import { Permission } from '@shared/models/file.model';
import { OKRPlans } from './../../model/okrPlan.model';
import { CodxOmService } from 'projects/codx-om/src/public-api';
import { Util } from 'codx-core';
import { OMCONST } from './../../codx-om.constant';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  CodxFormComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { Targets } from '../../model/okr.model';
import { row } from '@syncfusion/ej2-angular-grids';

//import { CodxEpService } from '../../../codx-ep.service';

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
  modelOKR: any;
  curOrgName = '';
  okrFG: FormGroup;
  listFG: any;
  dataOKR: any;
  obGrid: any;
  krGrid: any;
  skrGrid: any;
  owner: any;
  funcType: any;
  isAdd = false;
  curOrgID: any;
  okrFM: any;
  okrVll: any;
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
    this.headerText = dialogData.data[3];
    this.curOrgID = dialogData.data[4];
    this.curOrgName = dialogData.data[5];
    this.okrFM = dialogData.data[6];
    this.okrVll = dialogData.data[7];
    this.funcType = dialogData.data[8];

    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    this.modelOKR = dialogData.data[2];
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.isAdd = true;
      this.modelOKR.items = [];
      this.modelOKR.isAdd = true;
      this.modelOKR.okrLevel = this.okrPlan.okrLevel;
      this.modelOKR.periodID = this.okrPlan.periodID;
      this.modelOKR.year = this.okrPlan.year;
      this.modelOKR.interval = this.okrPlan.interval;
      this.modelOKR.okrType = this.obType;
      this.modelOKR.target = 0;
      this.modelOKR.measurement = null;
      this.dataOKR = [{ ...this.modelOKR }];
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
    this.cache
      .gridViewSetup(
        this.okrFM?.obFM?.formName,
        this.okrFM?.obFM?.gridViewName
      )
      .subscribe((obGrd) => {
        if (obGrd) {
          this.obGrid = Util.camelizekeyObj(obGrd);
          console.log(this.obGrid);
        }
      });
    this.cache
      .gridViewSetup(
        this.okrFM?.krFM?.formName,
        this.okrFM?.krFM?.gridViewName
      )
      .subscribe((krGrd) => {
        if (krGrd) {
          this.krGrid = Util.camelizekeyObj(krGrd);
        }
      });
    this.cache
      .gridViewSetup(
        this.okrFM?.skrFM?.formName,
        this.okrFM?.skrFM?.gridViewName
      )
      .subscribe((skrGrd) => {
        if (skrGrd) {
          this.skrGrid = Util.camelizekeyObj(skrGrd);
        }
      });

      this.cache
      .valueList("OM004"
      )
      .subscribe((skrGrd) => {
        if (skrGrd) {
          let x = skrGrd;
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
      .getAllOKROfPlan(this.okrPlan.recID)
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
    if (type && obIndex != null && krIndex != null) {
      let tmpOKR = { ...this.modelOKR };
      tmpOKR.items = [];
      tmpOKR.isAdd = true;
      switch (type) {
        case this.obType:
          tmpOKR.okrType = this.obType;
          this.dataOKR.push(tmpOKR);
          break;

        case this.krType:
          if (this.dataOKR[obIndex]?.okrName == null) {
            this.notificationsService.notify('OM002');
            return;
          }
          if (!this.dataOKR[obIndex]?.items) {
            this.dataOKR[obIndex].items = [];
          }
          tmpOKR.okrType = this.krType;
          this.dataOKR[obIndex]?.items.push(tmpOKR);
          break;

        case this.skrType:
          if (this.dataOKR[obIndex]?.items[krIndex]?.okrName == null) {
            this.notificationsService.notify('OM002');
            return;
          }
          if (!this.dataOKR[obIndex]?.items[krIndex]?.items) {
            this.dataOKR[obIndex].items[krIndex].items = [];
          }
          tmpOKR.okrType = this.skrType;
          this.dataOKR[obIndex]?.items[krIndex]?.items.push(tmpOKR);
          break;
      }

      this.detectorRef.detectChanges();
    }
  }
  obChange(evt: any, obIndex: number) {
    if (evt && evt?.field && evt?.data != null && obIndex != null) {
      this.dataOKR[obIndex][evt?.field] = evt?.data;

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
  inputValidate(){
    for (let ob of this.dataOKR) {
      ob.weight= 1/this.dataOKR.length;
      if (ob.okrName == null || ob.okrName == '') {
        this.notificationsService.notify('OM002');
        return;
      } else {
        for (let kr of ob.items) {
          
          kr.weight= 1/ob.items.length;
          if (kr.okrName == null || kr.okrName == '') {
            this.notificationsService.notify('OM002');
            return;
          } else {            
            for (let skr of kr.items) {
              skr.weight= 1/kr.items.length;
              if (skr.okrName == null || skr.okrName == '') {
                this.notificationsService.notify('OM002');
                return;
              }
            }
          }
        }
      }
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onSaveForm() {
    this.inputValidate();
    this.codxOmService
      .addEditOKRPlans(this.okrPlan, this.dataOKR, this.isAdd)
      .subscribe((res) => {
        if (res) {
          let x = res;
          this.dialogRef && this.dialogRef.close(true);
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
