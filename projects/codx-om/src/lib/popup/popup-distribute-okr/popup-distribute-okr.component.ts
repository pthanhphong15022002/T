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
  isAfterRender = true;
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
          this.codxOmService
            .getlistOrgUnit(tempOrgID)
            .subscribe((listOrg: any) => {
              if (listOrg) {
                this.orgUnitTree = listOrg;
                this.codxOmService
                  .getOKRHavedLinks(this.okrRecID)
                  .subscribe((links: any) => {
                    //Tạo sơ đồ tổ chức có okr đã phân bổ
                    if (links && links.length > 0) {
                      let oldLinks = links;
                      Array.from(this.orgUnitTree.listChildrens).forEach(
                        (item: any) => {
                          let temp = new DistributeOKR();
                          let oldLink = oldLinks.filter((itemLink) => {
                            return itemLink?.orgUnitID == item.orgUnitID;
                          });
                          if (oldLink != null && oldLink.length > 0) {
                            oldLink = oldLink.pop();
                            this.listDistribute.push(oldLink);
                          } else {
                            temp.okrName = this.dataOKR?.okrName;
                            temp.orgUnitID = item?.orgUnitID;
                            temp.orgUnitName = item?.orgUnitName;                         
                            temp.owner = item?.owner;
                            temp.employeeID = item?.employeeID;
                            temp.umid = this.dataOKR?.umid;
                            temp.refType = '1'; //Phân bổ
                            temp.objectID = item?.orgUnitID;
                            temp.objectType = this.orgTypeToObjectType(
                              item?.orgUnitType
                            );
                            temp.okrID = this.dataOKR?.recID;
                            temp.okrType = this.dataOKR?.okrType;
                            temp.isActive = false;
                            temp.distributePct = 0;
                            temp.distributeValue = 0;
                            this.listDistribute.push(temp);
                          }
                        }
                      );
                      this.detectorRef.detectChanges();
                      this.isAdd = false;
                      this.isAfterRender = true;
                    } else {
                      Array.from(this.orgUnitTree.listChildrens).forEach(
                        (item: any) => {
                          let temp = new DistributeOKR();
                          temp.okrName = this.dataOKR?.okrName;
                          temp.orgUnitID = item?.orgUnitID;
                          temp.orgUnitName = item?.orgUnitName;                          
                          temp.owner = item?.owner;
                          temp.employeeID = item?.employeeID;
                          temp.umid = this.dataOKR?.umid;
                          temp.refType = '1'; //Phân bổ
                          temp.objectID = item?.orgUnitID;
                          temp.objectType = this.orgTypeToObjectType(
                            item?.orgUnitType
                          );
                          temp.okrID = this.dataOKR?.recID;
                          temp.okrType = this.dataOKR?.okrType;
                          temp.isActive = false;
                          temp.distributePct = 0;
                          temp.distributeValue = 0;
                          this.listDistribute.push(temp);
                        }
                      );
                      this.isAdd = true;
                      this.detectorRef.detectChanges();
                      this.isAfterRender = true;
                    }
                  });
              }
            });
        }
      });
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
        }
        this.dialogRef && this.dialogRef.close();
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  orgTypeToObjectType(orgUnitType: string) {
    switch (orgUnitType) {
      case '1':
        return OMCONST.OBJECT_TYPE.COMP;
      case '4':
        return OMCONST.OBJECT_TYPE.DEPT;
      case '6':
        return OMCONST.OBJECT_TYPE.ORG;
      default:
        return null;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  
}
