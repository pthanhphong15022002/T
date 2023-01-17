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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';
import { PopupOKRWeightComponent } from '../popup-okr-weight/popup-okr-weight.component';
import { link } from 'fs';

@Component({
  selector: 'popup-assignment-okr',
  templateUrl: './popup-assignment-okr.component.html',
  styleUrls: ['./popup-assignment-okr.component.scss'],
})
export class PopupAssignmentOKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('body') body: TemplateRef<any>;

  dialogRef: DialogRef;
  title='';
  okrName='';
  okrRecID: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender=false;
  dataOKR: any;
  funcID:'';
  radioKRCheck=true;
  radioOBCheck=false;
  listDistribute=[];
  isAdd:boolean;
  typeKR= OMCONST.VLL.OKRType.KResult;
  typeOB= OMCONST.VLL.OKRType.Obj;
  cbbOrg=[];  
  fields: Object = { text: 'orgUnitName', value: 'orgUnitID' };
  assignmentOKR:any;
  distributeToType: string;
  distributeType: any;
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
    this.okrRecID=dialogData.data[1];
    this.distributeType=dialogData.data[2];
    this.funcID=dialogData.data[3];
    this.title = dialogData?.data[4];
    this.curUser= authStore.get();    
    this.assignmentOKR=new DistributeOKR(); 
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
    this.getOKRAssign();
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
  
  getOKRAssign(){
    this.codxOmService
    .getOKRByID(this.okrRecID)
    .subscribe((res: any) => {
      if (res) {
        this.codxOmService.getOKRLink(this.okrRecID).subscribe((links:any)=>{
          if(links && links.length>0){
            let oldLink = links[0];
            this.assignmentOKR.okrName= oldLink?.okrName;
            this.assignmentOKR.umid=oldLink?.umid;
            this.assignmentOKR.isActive=true;
            this.assignmentOKR.distributePct=oldLink?.distributePct;
            this.assignmentOKR.distributeValue=oldLink?.distributeValue;
            this.assignmentOKR.orgUnitID=oldLink?.orgUnitID;
            this.assignmentOKR.orgUnitName=oldLink?.orgUnitName;            
            this.detectorRef.detectChanges();
            this.isAdd=false;
            this.isAfterRender=true;
          }
          else{            
            this.dataOKR = res;
            this.assignmentOKR.okrName= this.dataOKR?.okrName;
            this.assignmentOKR.umid=this.dataOKR?.umid;
            this.assignmentOKR.isActive=false;
            this.assignmentOKR.distributePct=100;
            this.assignmentOKR.distributeValue=this.dataOKR?.target;
            this.isAdd=true;
            this.detectorRef.detectChanges();
            this.isAfterRender=true;
          }
          
        });
      }      
    });
  }
  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//
  
  
  onSaveForm(){
    if(this.assignmentOKR.orgUnitID==null){
      this.notificationsService.notify("OM",'2',null);
      return;
    }
    this.codxOmService.distributeOKR(this.dataOKR.recID,this.distributeToType,[this.assignmentOKR],this.isAdd)
    .subscribe(res=>{
      if(res){        
        this.notificationsService.notifyCode('SYS034');
      }
      this.dialogRef && this.dialogRef.close();
    })
  }
  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
  cbxOrgChange(evt:any){
    if(evt?.data!=null){     
      this.assignmentOKR.orgUnitID= evt.data;
      this.assignmentOKR.orgUnitName= evt.component?.itemsSelected[0]?.OrgUnitName;
      this.detectorRef.detectChanges();
    }
  }
  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//
  cancel(){
    this.dialogRef.close();
  }
  nameChange(evt:any){
    if(evt && evt?.data){
      this.assignmentOKR.okrName= evt.data;
      this.detectorRef.detectChanges();
    }
  }
  deleteOrg(){
    this.assignmentOKR.orgUnitID= null;
    //this.assignmentOKR.orgUnitName= null;
    this.detectorRef.detectChanges();
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
