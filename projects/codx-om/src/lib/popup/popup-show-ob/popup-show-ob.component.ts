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
  selector: 'popup-show-ob',
  templateUrl: 'popup-show-ob.component.html',
  styleUrls: ['popup-show-ob.component.scss'],
})
export class PopupShowOBComponent extends UIComponent implements AfterViewInit {
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
  title='';
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
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText = 'Xem chi tiết - Mục tiêu'; //dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.obRecID = dialogData.data[0];    
    this.title = dialogData.data[1];
    this.formModel=dialogRef.formModel;
  
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
    this.getObjectData();    
    this.getListAlign();
    //this.getChartData();
    
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  getItemOKR(i: any, recID: any) {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }
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

  //#region Chart
  // getChartData() {
  //   let krDetail = this.dataKR;
  //   switch (krDetail.interval) {
  //     case 'Y':
  //       this.getCheckInsByYear(krDetail);
  //       break;
  //     case 'Q':
  //       this.getCheckInsByQuarter(krDetail);
  //       break;
  //     case 'M':
  //       this.getCheckInsByMonth(krDetail);
  //       break;
  //   }
  // }

  // getCheckInsByYear(data: any) {
  //   const checkIns = data.checkIns;
  //   const targets = data.targets;
  //   const progressHistory = this.progressHistory;
  //   const progressHistoryReverse = [...progressHistory].reverse();
  //   let tempTarget = 0;

  //   if (!targets) {
  //     return;
  //   }

  //   if (checkIns && checkIns.length > 0) {
  //     targets.map((target, index) => {
  //       let tmpCheckIn: any = {};
  //       tmpCheckIn.percent = progressHistoryReverse[index];
  //       tmpCheckIn.period = `Q${index + 1}`;
  //       tempTarget = tempTarget + (target.target / data.target) * 100;
  //       tmpCheckIn.target = tempTarget;
  //       this.chartData.data.push(tmpCheckIn);
  //     });
  //   }
  // }

  // getCheckInsByQuarter(data: any) {
  //   const checkIns = data.checkIns;
  //   const targets = data.targets;
  //   const progressHistory = this.progressHistory;
  //   const progressHistoryReverse = [...progressHistory].reverse();
  //   let tempTarget = 0;

  //   if (!targets) {
  //     return;
  //   }

  //   if (checkIns && checkIns.length > 0) {
  //     targets.map((target, index) => {
  //       let tmpCheckIn: any = {};
  //       tmpCheckIn.percent = progressHistoryReverse[index];
  //       tmpCheckIn.period = `M${index + 1}`;
  //       tempTarget = tempTarget + (target.target / data.target) * 100;
  //       tmpCheckIn.target = tempTarget;
  //       this.chartData.data.push(tmpCheckIn);
  //     });
  //   }
  // }

  // getCheckInsByMonth(data: any) {
  //   const checkIns = data.checkIns;
  //   const targets = data.targets;
  //   const progressHistory = this.progressHistory;
  //   const progressHistoryReverse = [...progressHistory].reverse();
  //   let tempTarget = 0;

  //   if (!targets) {
  //     return;
  //   }

  //   if (checkIns && checkIns.length > 0) {
  //     targets.map((target, index) => {
  //       let tmpCheckIn: any = {};
  //       tmpCheckIn.percent = progressHistoryReverse[index];
  //       tmpCheckIn.period = `W${index + 1}`;
  //       tempTarget = tempTarget + (target.target / data.target) * 100;
  //       tmpCheckIn.target = tempTarget;
  //       this.chartData.data.push(tmpCheckIn);
  //     });
  //   }
  // }
  //#endregion Chart

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
