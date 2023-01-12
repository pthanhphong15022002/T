import { ConnectorModel, Diagram, DiagramTools, NodeModel, SnapConstraints, SnapSettingsModel } from '@syncfusion/ej2-angular-diagrams';
import { Permission } from '@shared/models/file.model';
import { DistributeOKR } from './../../model/distributeOKR.model';
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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';
import { PopupOKRWeightComponent } from '../popup-okr-weight/popup-okr-weight.component';

@Component({
  selector: 'popup-distribute-okr',
  templateUrl: './popup-distribute-okr.component.html',
  styleUrls: ['./popup-distribute-okr.component.scss'],
})
export class PopupDistributeOKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('body') body: TemplateRef<any>;
  datasetting: any = null;
  dataSource:any = null;
  public layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 60,
    horizontalSpacing: 60,
    enableAnimation: true,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None
  };
  dialogRef: DialogRef;
  typeKR= OMCONST.VLL.OKRType.KResult;
  typeOB= OMCONST.VLL.OKRType.Obj;
  headerText='';
  okrName='';
  recID: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender=false;
  dataOKR: any;
  funcID:'';
  radioKRCheck=true;
  radioOBCheck=false;
  distributeToType:any;
  distributeType:any;
  listDistribute=[];

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
    this.okrName=dialogData.data[0];    
    this.recID=dialogData.data[1];
    this.distributeType=dialogData.data[2];
    this.funcID=dialogData.data[3];
    this.headerText = dialogData?.data[4];
    this.curUser= authStore.get();
    this.distributeToType=this.distributeType;
    if(this.distributeToType==this.typeKR){      
      this.radioKRCheck=true;
      this.radioOBCheck=false;
    }
    else{
      this.radioKRCheck=false;
      this.radioOBCheck=true;
    }
  }
  //-----------------------Base Func-------------------------//
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
    this.getOKRByID();
   
      if(this.curUser?.employee!=null) 
      {          
        let tempOrgID='';   
        switch (this.funcID){
          case OMCONST.FUNCID.COMP:
            tempOrgID=this.curUser?.employee.companyID;
          break;
          case OMCONST.FUNCID.DEPT:
            tempOrgID=this.curUser?.employee.departmentID;
          break;
          case OMCONST.FUNCID.ORG:
            tempOrgID=this.curUser?.employee.orgUnitID;
          break;
          case OMCONST.FUNCID.PERS:
            tempOrgID=this.curUser?.employee.employeeID;
          break;
        }
        this.codxOmService.getlistOrgUnit(tempOrgID).subscribe((res:any)=>{
          if(res){
            this.orgUnitTree= res;           
            Array.from(this.orgUnitTree.listChildrens).forEach((item:any)=>{
              let temp = new DistributeOKR();
              temp.okrName= this.dataOKR.okrName;
              temp.orgUnitID= item.orgUnitID;
              temp.orgUnitName= item.orgUnitName;
              temp.umid=this.dataOKR.umid;
              temp.isActive=false;
              temp.distributePct=0;
              temp.distributeValue= 0;
              this.listDistribute.push(temp);
            })
            this.detectorRef.detectChanges();
            this.isAfterRender=true;
          }
        });
      }
    
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  valueTypeChange(event) {
    
      if (event?.field==this.typeKR) {
        this.distributeToType=OMCONST.VLL.OKRType.KResult;
      } else if(event?.field==this.typeOB){
        this.distributeToType=OMCONST.VLL.OKRType.Obj;
      }
    this.detectorRef.detectChanges();
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  
  // getKRAndOBParent(){
  //   this.codxOmService
  //   .getKRAndOBParent(this.recID)
  //   .subscribe((res: any) => {
  //     if (res) {
  //       this.dataOB = res;
  //       this.dataKR = res.child[0];            
  //       this.detectorRef.detectChanges();
  //     }
  //   });
  // }
  getOKRByID(){
      this.codxOmService
      .getOKRByID(this.recID)
      .subscribe((res: any) => {
        if (res) {
          this.dataOKR = res;
        }
      });
    }
  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//
  
  
  onSaveForm(){
    let lastListDistribute =this.listDistribute.filter((item) => {
      return item?.isActive ==true;
    });
    this.codxOmService.distributeOKR(this.dataOKR.recID,this.distributeToType,lastListDistribute)
    .subscribe(res=>{
      let x= res;
      this.dialogRef && this.dialogRef.close();
      
    })
  }
  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
  
  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//
  cancel(){
    this.dialogRef.close();
  }
  valueChange(evt:any){
    if(evt && evt.field !=null){
      this.listDistribute[evt.field].distributeValue= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  percentChange(evt:any){
    if(evt && evt.field !=null){
      this.listDistribute[evt.field].distributePct= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  umidChange(evt:any){
    if(evt && evt.field !=null){
      this.listDistribute[evt.field].umid= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  nameChange(evt:any){
    if(evt && evt.field !=null){
      this.listDistribute[evt.field].okrName= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  disabledChild(evt:any,index:number){
    if(evt && index!=null){
      this.listDistribute[index].isActive=!this.listDistribute[index].isActive;
      if(!this.listDistribute[index].isActive){
        
        this.listDistribute[index].distributePct =0;
        this.listDistribute[index].distributeValue =0;
      }
      this.detectorRef.detectChanges();
      let activeChild= this.listDistribute.filter((child) => {
        return child?.isActive == true;
      });
      this.listDistribute.forEach(item=>{
        if(item.isActive){
          item.distributePct =100/activeChild.length;
          item.distributeValue =this.dataOKR.target/activeChild.length;
        }
      });
    }
  }
  async onSelectionChanged($event) {
    //await this.setEmployeePredicate($event.dataItem.orgUnitID);
    // this.employList.onChangeSearch();
  }
  public connDefaults(
    connector: ConnectorModel,
    diagram: Diagram
  ): ConnectorModel {
    connector.targetDecorator.shape = "None";
    connector.type = "Orthogonal";
    connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style.strokeColor = "#6d6d6d";
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    obj.expandIcon = {
      height: 15,
      width: 15,
      shape: "Minus",
      fill: "lightgray",
      offset: { x: 0.5, y: 1}
    };
    obj.collapseIcon = {
      height: 15,
      width: 15,
      shape: "Plus",
      fill: "lightgray",
      offset: { x: 0.5, y: 1 }
    };
    return obj;
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
