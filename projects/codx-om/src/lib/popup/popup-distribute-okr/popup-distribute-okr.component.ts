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
  templateUrl: 'popup-distribute-okr.component.html',
  styleUrls: ['popup-distribute-okr.component.scss'],
})
export class PopupDistributeOKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('distributeKR') distributeKR: TemplateRef<any>;

  dialogRef: DialogRef;
  headerText='';
  obName='';
  krName='';
  recID: any;
  distributeType: any;
  curUser: any;
  userInfo: any;
  orgUnitTree: any;
  isAfterRender=false;
  dataOB: any;
  dataKR: any;
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
    this.obName=dialogData.data[0];
    this.krName=dialogData.data[1];    
    this.recID=dialogData.data[2];
    this.distributeType=dialogData.data[3];
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
          panelRightRef: this.distributeKR,
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
        this.codxOmService.getlistOrgUnit(this.userInfo.companyID).subscribe((res:any)=>{
          if(res){
            this.orgUnitTree= res;           
            Array.from(this.orgUnitTree.childrens).forEach((item:any)=>{
              let temp = new DistributeOKR();
              temp.okrName= this.dataKR.okrName;
              temp.orgUnitID= item.orgUnitID;
              temp.orgUnitName= item.orgUnitName;
              temp.umid=this.dataKR.umid;
              temp.distributePct=100/this.orgUnitTree.CountChild;
              temp.distributeValue= this.dataKR.target/this.orgUnitTree.CountChild;
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
  //Sửa trọng số KR
  editWeight(obRecID: any) {
    //OM_WAIT: tiêu đề tạm thời gán cứng
    let popupTitle='Thay đổi trọng số cho KRs';
    let subTitle='Tính kết quả thực hiện cho mục tiêu';
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [obRecID, OMCONST.VLL.OKRType.KResult, popupTitle,subTitle],
      '',
      dModel
    );
  }

  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
