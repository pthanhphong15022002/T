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
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('alignKR') alignKR: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  formModelCheckin = new FormModel();
  dtStatus: any;
  dataOKR:any;
  listAlign=[];
  openAccordion = [];
  dataKR: any;
  progressHistory = [];
  krCheckIn = [];
  chartSettings: ChartSettings = {
    primaryXAxis: {
      valueType: 'Category',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift',
    },
    primaryYAxis: {
      minimum: 0,
      maximum: 100,
      interval: 20,
    },
    seriesSetting: [
      {
        type: 'SplineArea',
        xName: 'period',
        yName: 'percent',
        fill: '#dfe4e3',
        marker: {
          visible: true,
          height: 6,
          width: 6,
          shape: 'Circle',
          fill: '#20bdae',
        },
      },
      {
        type: 'Line',
        xName: 'period',
        yName: 'target',
        fill: '#000000',
        width: 1,
      },
    ],
  };

  chartData = {
    progress: 0,
    data: [],
  };

  dialogCheckIn: DialogRef;
  totalProgress: number;

  //#region gauge chart
  pointerBorder = {
    color: '#007DD1',
    width: 2,
  };

  rangeLinearGradient: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#9e40dc', offset: '0%', opacity: 1 },
      { color: '#d93c95', offset: '70%', opacity: 1 },
    ],
  };

  labelStyle: Object = {
    position: 'Outside',
    font: {
      fontFamily: 'inherit',
    },
    offset: 0,
  };
  obRecID: any;
  okrChild= [];
  listChild=[];
  title='';
  obName: any;
  krName: any;
  curUser:any;
  userInfo:any;
  orgUnitTree: any;
  companyName='';
  isAfterRender=false;
  load(args: ILoadedEventArgs): void {
    // custom code start
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.gauge.theme = <GaugeTheme>(
      (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
    // custom code end
  }
  //#endregion gauge chart

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
    this.curUser= authStore.get();
    this.cache.getCompany(this.curUser.userID).subscribe(item=>{
      if(item) 
      {
        this.userInfo=item;        
        this.codxOmService.getlistOrgUnit(this.userInfo.companyID).subscribe((res:any)=>{
          if(res){
            this.orgUnitTree= res;
            let temp= new DistributeOKR();
            temp.okrName= this.krName;
            temp

            this.detectorRef.detectChanges();
            this.isAfterRender=true;
          }
        });
      }
    })
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
          panelRightRef: this.alignKR,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    
    //this.getObjectData();    
    //this.getListAlign();
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  
  getObjectData(){
    this.codxOmService
        .getObjectAndKRChild(this.obRecID)
        .subscribe((res: any) => {
          if (res) {
            this.dataOKR = res;
            this.okrChild = res.child;            
            this.detectorRef.detectChanges();
          }
        });
  }
  getListAlign(){
    this.codxOmService
        .getListAlign(this.obRecID)
        .subscribe((res: any) => {
          if (res) {
            this.listAlign = res;           
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
