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
  recID: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender=false;
  dataOKR: any;
  funcID:'';
  radioKRCheck=true;
  radioOBCheck=false;
  listDistribute=[];

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
    this.recID=dialogData.data[1];
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
    this.getOKRByID();
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
  
  getOKRByID(){
    this.codxOmService
    .getOKRByID(this.recID)
    .subscribe((res: any) => {
      if (res) {
        this.dataOKR = res;       
        this.assignmentOKR.okrName= this.dataOKR.okrName;
        this.assignmentOKR.umid=this.dataOKR.umid;
        this.assignmentOKR.isActive=false;
        this.assignmentOKR.distributePct=100;
        this.assignmentOKR.distributeValue=this.dataOKR.target;
        this.detectorRef.detectChanges();
        this.isAfterRender=true;
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
    this.codxOmService.distributeOKR( this.dataOKR.recID,this.distributeToType,[this.assignmentOKR])
    .subscribe(res=>{
      let x= res;
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
  
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
