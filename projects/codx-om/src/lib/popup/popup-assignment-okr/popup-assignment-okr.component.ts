import { Permission } from '@shared/models/file.model';
import { DistributeOKR } from '../../model/distributeOKR.model';
import { C } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CircularGaugeComponent,
  GaugeTheme,
  IAxisLabelRenderEventArgs,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-circulargauge';

import {
  AuthService,
  AuthStore,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
@Component({
  selector: 'popup-assignment-okr',
  templateUrl: './popup-assignment-okr.component.html',
  styleUrls: ['./popup-assignment-okr.component.scss'],
})
export class PopupAssignmentOKRComponent
  extends UIComponent
  implements AfterViewInit
{
  views: Array<ViewModel> | any = [];
  @ViewChild('body') body: TemplateRef<any>;

  dialogRef: DialogRef;
  title = '';
  okrName = '';
  okrRecID: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender = false;
  dataOKR: any;
  funcID: '';
  radioKRCheck = true;
  radioOBCheck = false;
  listDistribute = [];
  isAdd: boolean;
  typeKR = OMCONST.VLL.OKRType.KResult;
  typeOB = OMCONST.VLL.OKRType.Obj;
  cbbOrg = [];
  //fields: Object = { text: 'orgUnitName', value: 'orgUnitID' };
  assignmentOKR: any;
  distributeFromType: any;
  owner: any;
  compFuncID = OMCONST.FUNCID.COMP;
  deptFuncID = OMCONST.FUNCID.DEPT;
  orgFuncID = OMCONST.FUNCID.ORG;
  statusVLL :any
  okrPlan: any;
  okrPlanRecID: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.okrName = dialogData.data[0];
    this.okrRecID = dialogData.data[1];
    this.distributeFromType = dialogData.data[2];
    this.funcID = dialogData.data[3];
    this.title = dialogData?.data[4];
    this.okrPlanRecID = dialogData?.data[5];
    this.curUser = authStore.get();
    this.assignmentOKR = new DistributeOKR();
    // if (this.distributeToType == this.typeKR) {
    //   this.radioKRCheck = true;
    //   this.radioOBCheck = false;
    // } else {
    //   this.radioKRCheck = false;
    //   this.radioOBCheck = true;
    // }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.body,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    this.getCacheData();
    this.getOKRAssign();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData(){
    this.cache.valueList('OM002').subscribe(res=>{
      if(res){
        this.statusVLL=res?.datas;
      }
    })
    this.codxOmService.getOKRPlansByID(this.okrPlanRecID).subscribe(res=>{
      if(res){
        this.okrPlan=res;
      }
    })
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  getOKRAssign() {
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((res: any) => {
      if (res) {
        this.codxOmService.getOKRDistributed(this.okrRecID).subscribe((links: any) => {
          if (links && links.length > 0) {
            let oldLink = links[0];
            this.assignmentOKR.okrName = oldLink?.okrName;
            this.assignmentOKR.umid = oldLink?.umid;
            this.assignmentOKR.isActive = true;
            this.assignmentOKR.distributePct = oldLink?.distributePct;
            this.assignmentOKR.distributeValue = oldLink?.distributeValue;
            this.assignmentOKR.orgUnitID = oldLink?.orgUnitID;
            this.assignmentOKR.orgUnitName = oldLink?.orgUnitName;
            this.detectorRef.detectChanges();
            this.isAdd = false;
            this.codxOmService
              .getManagerByOrgUnitID(this.assignmentOKR.orgUnitID)
              .subscribe((ownerInfo) => {
                if (ownerInfo) {
                  this.owner = ownerInfo;
                  this.assignmentOKR.owner = this.owner?.userID;
                  this.assignmentOKR.employeeID = this.owner?.employeeID;
                  this.assignmentOKR.orgUnitID = this.owner?.orgUnitID;
                  this.assignmentOKR.departmentID = this.owner?.departmentID;
                  this.assignmentOKR.companyID = this.owner?.companyID;
                  this.assignmentOKR.positionID = this.owner?.positionID;
                  this.assignmentOKR.employeeName = this.owner?.employeeName;
                  this.assignmentOKR.orgUnitName = this.owner?.orgUnitName;
                  this.assignmentOKR.departmentName = this.owner?.departmentName;
                  this.assignmentOKR.companyName = this.owner?.companyName;
                  this.assignmentOKR.positionName = this.owner?.positionName;
                  
                  this.isAfterRender = true;
                }
              });
              
              this.isAfterRender = true;
          } else {
            this.dataOKR = res;
            this.assignmentOKR.okrName = this.dataOKR?.okrName;
            this.assignmentOKR.umid = this.dataOKR?.umid;
            this.assignmentOKR.isActive = false;
            this.assignmentOKR.distributePct = 100;
            this.assignmentOKR.distributeValue = this.dataOKR?.target;
            this.isAdd = true;
            this.detectorRef.detectChanges();
            this.isAfterRender = true;
          }
        });
        
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  // valueTypeChange(event) {
  //   if (event?.field == this.typeKR) {
  //     this.distributeToType = OMCONST.VLL.OKRType.KResult;
  //   } else if (event?.field == this.typeOB) {
  //     this.distributeToType = OMCONST.VLL.OKRType.Obj;
  //   }
  //   this.detectorRef.detectChanges();
  // }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  cancel() {
    this.dialogRef.close();
  }
  nameChange(evt: any) {
    if (evt && evt?.data) {
      this.assignmentOKR.okrName = evt.data;
      this.detectorRef.detectChanges();
    }
  }
  deleteOrg() {
    this.assignmentOKR.orgUnitID = null;
    //this.assignmentOKR.orgUnitName= null;
    this.detectorRef.detectChanges();
  }
  cbxOrgChange(evt: any) {
    if (evt?.data != null && evt?.data != '') {
      this.assignmentOKR.orgUnitID = evt.data;
      this.assignmentOKR.orgUnitName = evt.component?.itemsSelected[0]?.OrgUnitName;
      this.assignmentOKR.objectID = evt.data;
      this.codxOmService .getManagerByOrgUnitID(this.assignmentOKR.orgUnitID).subscribe((ownerInfo) => {
          if (ownerInfo) {
            this.owner = ownerInfo;
            this.assignmentOKR.owner = this.owner?.userID;
            this.assignmentOKR.employeeID = this.owner?.employeeID;
            this.assignmentOKR.orgUnitID = this.owner?.orgUnitID;
            this.assignmentOKR.departmentID = this.owner?.departmentID;
            this.assignmentOKR.companyID = this.owner?.companyID;
            this.assignmentOKR.positionID = this.owner?.positionID;

            this.assignmentOKR.employeeName = this.owner?.employeeName;
            this.assignmentOKR.orgUnitName = this.owner?.orgUnitName;
            this.assignmentOKR.departmentName = this.owner?.departmentName;
            this.assignmentOKR.companyName = this.owner?.companyName;
            this.assignmentOKR.positionName = this.owner?.positionName;
          }
        });

      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  onSaveForm() {
    if (this.assignmentOKR.orgUnitID == null) {
      this.notificationsService.notify('Đối tượng phân công không được bỏ trống', '2', null);
      return;
    }
    if (this.okrPlan.status!= '1') {
      this.notificationsService.notify('Kế hoạch mục tiêu kỳ ' + this.okrPlan?.periodID +' đang ở tình trạng' + this.statusVLL[this.okrPlan?.status]?.text+' nên không thể thay đổi đối tượng phân công', '2', null);
      return;
    }
    this.codxOmService.assignmentOKR( this.okrRecID, this.distributeFromType, this.assignmentOKR, this.isAdd, this.funcID).subscribe((res) => {
        if (res) {
          this.notificationsService.notifyCode('SYS034');
          
        this.dialogRef && this.dialogRef.close(this.okrPlan);
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
