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

  dialogRef: DialogRef;
  headerText='';
  okrName='';
  recID: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender=false;
  dataOB: any;
  dataKR: any;
  funcID:'';
  radioKRCheck=true;
  radioOBCheck=false;
  distributeType=OMCONST.VLL.OKRType.KResult;
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
    this.headerText = 'Xem chi tiết - Mục tiêu'; //dialogData?.data[2];
    this.dialogRef = dialogRef;    
    this.okrName=dialogData.data[0];    
    this.recID=dialogData.data[1];
    this.distributeType=dialogData.data[2];
    this.funcID=dialogData.data[3];
    this.curUser= authStore.get();
    
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
    this.getKRAndOBParent();
    this.cache.getCompany(this.curUser.userID).subscribe(item=>{
      if(item) 
      {
        this.userInfo=item;   
        let tempOrgID='';   
        switch (this.funcID){
          case OMCONST.FUNCID.COMP:
            tempOrgID=this.userInfo.companyID;
          break;
          case OMCONST.FUNCID.DEPT:
            tempOrgID=this.userInfo.departmentID;
          break;
          case OMCONST.FUNCID.ORG:
            tempOrgID=this.userInfo.orgUnitID;
          break;
          case OMCONST.FUNCID.PERS:
            tempOrgID=this.userInfo.employeeID;
          break;
        }
        this.codxOmService.getlistOrgUnit(tempOrgID).subscribe((res:any)=>{
          if(res){
            this.orgUnitTree= res;           
            Array.from(this.orgUnitTree.listChildrens).forEach((item:any)=>{
              let temp = new DistributeOKR();
              temp.okrName= this.dataKR.okrName;
              temp.orgUnitID= item.orgUnitID;
              temp.orgUnitName= item.orgUnitName;
              temp.umid=this.dataKR.umid;
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
    });
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  valueTypeChange(event) {
    
      if (event?.data) {
        this.distributeType=OMCONST.VLL.OKRType.KResult;
      } else {
        this.distributeType=OMCONST.VLL.OKRType.Obj;
      }
    this.detectorRef.detectChanges();
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  
  getKRAndOBParent(){
    this.codxOmService
    .getKRAndOBParent(this.recID)
    .subscribe((res: any) => {
      if (res) {
        this.dataOB = res;
        this.dataKR = res.child[0];            
        this.detectorRef.detectChanges();
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
    this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'DistributeKRAsync',
      [this.dataKR.recID,this.distributeType,lastListDistribute]
    ).subscribe(res=>{
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
  valueChange(evt:any){
    if(evt && evt.field){
      this.listDistribute[evt.field].distributeValue= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  percentChange(evt:any){
    if(evt && evt.field){
      this.listDistribute[evt.field].distributePct= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  umidChange(evt:any){
    if(evt && evt.field){
      this.listDistribute[evt.field].umid= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  nameChange(evt:any){
    if(evt && evt.field){
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
          item.distributeValue =this.dataKR.target/activeChild.length;
        }
      });
    }
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
