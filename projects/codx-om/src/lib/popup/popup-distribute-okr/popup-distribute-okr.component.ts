import {
  DiagramTools,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DistributeOKR } from './../../model/distributeOKR.model';
import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  AuthService,
  AuthStore,
  CallFuncService,
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
  selector: 'popup-distribute-okr',
  templateUrl: './popup-distribute-okr.component.html',
  styleUrls: ['./popup-distribute-okr.component.scss'],
})
export class PopupDistributeOKRComponent
  extends UIComponent
  implements AfterViewInit
{
  views: Array<ViewModel> | any = [];
  @ViewChild('body') body: TemplateRef<any>;
  datasetting: any = null;
  dataSource: any = null;
  public layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 60,
    horizontalSpacing: 60,
    enableAnimation: true,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  dialogRef: DialogRef;
  typeKR = OMCONST.VLL.OKRType.KResult;
  typeOB = OMCONST.VLL.OKRType.Obj;
  headerText = '';
  okrName = '';
  okrRecID: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender = false;
  dataOKR: any;
  isAdd: boolean;
  funcID: '';
  radioKRCheck = true;
  radioOBCheck = false;
  distributeToType: any;
  distributeType: any;
  listDistribute = [];
  currentUser: import('codx-core').UserModel;

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
    this.distributeType = dialogData.data[2];
    this.funcID = dialogData.data[3];
    this.headerText = dialogData?.data[4];
    this.currentUser = dialogData?.data[5];
    this.distributeToType = this.distributeType;
    if (this.distributeToType == this.typeKR) {
      this.radioKRCheck = true;
      this.radioOBCheck = false;
    } else {
      this.radioKRCheck = false;
      this.radioOBCheck = true;
    }
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
    this.getOKRAssign();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  getOKRAssign() {
    if (this.currentUser?.employee != null) {
      let tempOrgID = '';
      switch (this.funcID) {
        case OMCONST.FUNCID.COMP:
          tempOrgID = this.currentUser?.employee.companyID;
          break;
        case OMCONST.FUNCID.DEPT:
          tempOrgID = this.currentUser?.employee.departmentID;
          break;
        case OMCONST.FUNCID.ORG:
          tempOrgID = this.currentUser?.employee.orgUnitID;
          break;
        case OMCONST.FUNCID.PERS:
          tempOrgID = this.currentUser?.employee.employeeID;
          break;
      }
      this.codxOmService.getOKRByID(this.okrRecID).subscribe((res: any) => {
        if (res) {
          this.dataOKR = res;          
        }
      });
      this.codxOmService.getDataDistribute(this.okrRecID,tempOrgID).subscribe((res:any)=>{
        if(res){
          this.listDistribute=res;
          this.isAfterRender=true;
        }
      })
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  valueTypeChange(event) {
    if (event?.field == this.typeKR) {
      this.distributeToType = OMCONST.VLL.OKRType.KResult;
    } else if (event?.field == this.typeOB) {
      this.distributeToType = OMCONST.VLL.OKRType.Obj;
    }
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  cancel() {
    this.dialogRef.close();
  }
  valueChange(evt: any) {
    if (evt && evt.field != null) {
      this.listDistribute[evt.field].distributeValue = evt.data;
      this.detectorRef.detectChanges();
    }
  }
  percentChange(evt: any) {
    if (evt && evt.field != null) {
      this.listDistribute[evt.field].distributePct = evt.data;
      this.detectorRef.detectChanges();
    }
  }
  umidChange(evt: any) {
    if (evt && evt.field != null) {
      this.listDistribute[evt.field].umid = evt.data;
      this.detectorRef.detectChanges();
    }
  }
  nameChange(evt: any) {
    if (evt && evt.field != null) {
      this.listDistribute[evt.field].okrName = evt.data;
      this.detectorRef.detectChanges();
    }
  }
  disabledChild(evt: any, index: number) {
    if (evt && index != null) {
      this.listDistribute[index].isActive =
        !this.listDistribute[index].isActive;
      if (!this.listDistribute[index].isActive) {
        this.listDistribute[index].distributePct = 0;
        this.listDistribute[index].distributeValue = 0;
      }
      this.detectorRef.detectChanges();
      let activeChild = this.listDistribute.filter((child) => {
        return child?.isActive == true;
      });
      this.listDistribute.forEach((item) => {
        if (item.isActive) {
          item.distributePct = 100 / activeChild.length;
          item.distributeValue = this.dataOKR.target / activeChild.length;
        }
      });
    }
  }
  async onSelectionChanged($event) {
    //await this.setEmployeePredicate($event.dataItem.orgUnitID);
    // this.employList.onChangeSearch();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onSaveForm() {
    let lastListDistribute = this.listDistribute.filter((item) => {
      return item?.isActive == true;
    });
    this.codxOmService
      .distributeOKR(this.dataOKR.recID, lastListDistribute)
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notifyCode('SYS034');
          this.dialogRef && this.dialogRef.close(res);
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  orgTypeToObjectType(orgUnitType: string) {
    switch (orgUnitType) {
      case '1':
        return OMCONST.VLL.OKRLevel.COMP;
      case '4':
        return OMCONST.VLL.OKRLevel.DEPT;
      case '6':
        return OMCONST.VLL.OKRLevel.ORG;
      default:
        return null;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  
}
