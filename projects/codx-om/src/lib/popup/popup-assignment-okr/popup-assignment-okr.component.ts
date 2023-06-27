import { DistributeOKR } from '../../model/distributeOKR.model';
import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  AuthStore,
  DialogData,
  DialogRef,
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
  tabControl = [
    {
      name: 'OrgUnit',
      textDefault: 'Sơ đồ tổ chức',
      isActive: true,
      icon: 'icon-i-diagram-3-fill',
      disabled:false,
    },
    {
      name: 'Position',
      textDefault: 'Cấp trực tiếp',
      isActive: false,
      icon: 'icon-groups',
      disabled:false,
    },
    {
      name: 'Employee',
      textDefault: 'Nhân viên',
      isActive: false,
      icon: 'icon-account_circle',
      disabled:false,
    },
    
  ];
  assignmentOKR: any;
  distributeFromType: any;
  owner: any;
  compFuncID = OMCONST.FUNCID.COMP;
  deptFuncID = OMCONST.FUNCID.DEPT;
  orgFuncID = OMCONST.FUNCID.ORG;
  statusVLL :any
  okrPlan: any;
  okrPlanRecID: any;
  offset: string;
  activeTab: string;
  cbbOrgData:any;
  cbbPosData:any;
  cbbEmpData:any;
  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
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
    this.loadTabView();
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
  loadTabView() {
    this.offset = '0px';
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  getOKRAssign() {
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((res: any) => {
      if (res) {  
        this.dataOKR = res;
        this.codxOmService.getOKRHavedLinks(this.okrRecID,OMCONST.VLL.RefType_Link.Assign).subscribe((links: any) => {
          if (links && links.length > 0) {
            this.assignmentOKR = links[0];
            this.detectorRef.detectChanges();
            this.isAdd = false;
            if(this.assignmentOKR?.objectType==OMCONST.VLL.OKRLevel.DEPT || this.assignmentOKR?.objectType==OMCONST.VLL.OKRLevel.ORG){              
              this.tabControl[0].isActive=true;
              this.tabControl[1].disabled=true;
              this.tabControl[2].disabled=true;  
              this.activeTab="OrgUnit";
              this.detectorRef.detectChanges();
            }
            else if(this.assignmentOKR?.objectType==OMCONST.VLL.OKRLevel.POSITION){              
              this.tabControl[0].disabled=true;this.tabControl[0].isActive=false;
              this.tabControl[1].isActive=true;
              this.tabControl[2].disabled=true;  
              this.activeTab="Position";
              this.detectorRef.detectChanges();
            }
            else if(this.assignmentOKR?.objectType==OMCONST.VLL.OKRLevel.PERS){
              this.tabControl[0].disabled=true;this.tabControl[0].isActive=false;
              this.tabControl[1].disabled=true;
              this.tabControl[2].isActive=true;  
              this.activeTab="Employee";
              this.detectorRef.detectChanges();
            }
            this.isAfterRender = true;
          } else {
            this.assignmentOKR.okrName = this.dataOKR?.okrName;
            this.assignmentOKR.umid = this.dataOKR?.umid;
            this.assignmentOKR.isActive = false;
            this.assignmentOKR.distributePct = 100;
            this.assignmentOKR.distributeValue = this.dataOKR?.target;
            this.assignmentOKR.refType='2';//Phân công
            this.isAdd = true;
            this.detectorRef.detectChanges();
            this.isAfterRender = true;
            this.activeTab = 'OrgUnit';
          }
        });
        
      }
      else{        
        this.activeTab = 'OrgUnit';
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
  clickMenu(item) {
    if(item?.disabled) return;
    this.activeTab = item.name;
    for (let i = 0; i < this.tabControl.length; i++) {
      if (this.tabControl[i].isActive == true) {
        this.tabControl[i].isActive = false;
      }
    }
    item.isActive = true;
    this.detectorRef.detectChanges();
  }
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
    this.assignmentOKR.objectID=null;
    this.tabControl[1].disabled=false;
    this.tabControl[2].disabled=false;
    this.tabControl[0].disabled=false;
    this.cbbOrgData=null;
    this.cbbPosData=null;    
    this.cbbEmpData=null;
    this.detectorRef.detectChanges();
  }
  orgTypeToObjectType(orgUnitType:string){
    switch(orgUnitType){
      case '1': return OMCONST.VLL.OKRLevel.COMP; 
      case '4': return OMCONST.VLL.OKRLevel.DEPT;
      case '6': return OMCONST.VLL.OKRLevel.ORG;
      default : return null;
    }
  }
  cbxOrgChange(evt: any) {
    if (evt?.data != null && evt?.data != '') {
      this.assignmentOKR.objectID = evt.data;
      this.cbbOrgData=evt?.data;
      this.codxOmService.getManagerByOrgUnitID(this.assignmentOKR.objectID).subscribe((ownerInfo:any) => {
          if (ownerInfo) {
            this.assignTo(ownerInfo);            
            this.assignmentOKR.objectType=this.orgTypeToObjectType(ownerInfo?.orgUnitType)
          }
        });

      this.tabControl[1].disabled=true;
      this.tabControl[2].disabled=true;
      this.detectorRef.detectChanges();
    }
  }

  cbxPosChange(evt: any) {
    if (evt?.data != null && evt?.data != '') {
      this.assignmentOKR.objectID = evt.data;
      this.cbbPosData=evt?.data;
      this.codxOmService.getEmployeesByPositionID(this.assignmentOKR?.objectID).subscribe((res:any) => {
          if (res) {
            this.codxOmService.getEmployeesByEmpID(res[0]?.employeeID).subscribe((ownerInfo) => {
              if (ownerInfo) {
                this.assignTo(ownerInfo);
                this.assignmentOKR.objectType=OMCONST.VLL.OKRLevel.POSITION;
              }
            });
    
          }
        });
        
      this.tabControl[0].disabled=true;
      this.tabControl[2].disabled=true;
      this.detectorRef.detectChanges();
    }
  }
  cbxEmpChange(evt: any) {
    if (evt?.data != null && evt?.data != '') {
      this.assignmentOKR.objectID = evt.data;
      this.cbbEmpData=evt?.data;
      this.codxOmService.getEmployeesByEmpID(this.assignmentOKR.objectID).subscribe((ownerInfo) => {
          if (ownerInfo) {
            this.assignTo(ownerInfo);
            this.assignmentOKR.objectType=OMCONST.VLL.OKRLevel.PERS;
          }
        });

        this.tabControl[1].disabled=true;
        this.tabControl[0].disabled=true;
      this.detectorRef.detectChanges();
    }
  }
  assignTo(owner:any){
    this.assignmentOKR.owner = owner?.domainUser;
    this.assignmentOKR.employeeID = owner?.employeeID;
    this.assignmentOKR.orgUnitID = owner?.orgUnitID;
    this.assignmentOKR.departmentID = owner?.departmentID;
    this.assignmentOKR.companyID = owner?.companyID;
    this.assignmentOKR.positionID = owner?.positionID;
    this.assignmentOKR.employeeName = owner?.employeeName;
    this.assignmentOKR.orgUnitName = owner?.orgUnitName;
    this.assignmentOKR.departmentName = owner?.departmentName;
    this.assignmentOKR.companyName = owner?.companyName;
    this.assignmentOKR.positionName = owner?.positionName;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  onSaveForm() {    
    if (this.okrPlan.status!= '1') {
      this.notificationsService.notify('Kế hoạch mục tiêu kỳ ' + this.okrPlan?.periodID +' đang ở tình trạng' + this.statusVLL[this.okrPlan?.status]?.text+' nên không thể thay đổi đối tượng phân công', '2', null);
      return;
    }
    this.codxOmService.assignmentOKR( this.dataOKR?.recID, this.dataOKR?.okrType, this.assignmentOKR, this.isAdd, this.funcID).subscribe((res) => {
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
