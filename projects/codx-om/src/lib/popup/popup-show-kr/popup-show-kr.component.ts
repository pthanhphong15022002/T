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
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';

@Component({
  selector: 'popup-show-kr',
  templateUrl: 'popup-show-kr.component.html',
  styleUrls: ['popup-show-kr.component.scss'],
})
export class PopupShowKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('alignKR') alignKR: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  formModelCheckin = new FormModel();
  dtStatus: any;
  dataOKR = [];
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
        // trendlines: [
        //   {
        //     type: 'Linear',
        //     name: 'Trends',
        //     width: 3,
        //     marker: { visible: true },
        //     fill: '#C64A75',
        //   },

        // ],
      },
    ],
  };
  chartData = {
    progress: 0,
    checkIns: [],
    distribute: [],
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
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText = 'Xem chi tiết - Kết quả chính'; //dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.dataOKR.push(dialogData.data[1]);
    this.dataKR = dialogData.data[0];

    //tính giá trị progress theo các lần checkIn
    this.totalProgress = this.dataKR.progress;
    if (this.dataKR?.checkIns) {
      this.dataKR.checkIns = Array.from(this.dataKR?.checkIns).reverse();
      this.krCheckIn = Array.from(this.dataKR?.checkIns);
      this.krCheckIn.forEach((element) => {
        if (this.krCheckIn.indexOf(element) == 0) {
          this.progressHistory.push(this.totalProgress);
        } else {
          this.totalProgress -=
            this.krCheckIn[this.krCheckIn.indexOf(element) - 1].value;
          this.progressHistory.push(this.totalProgress);
        }
      });
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
          panelRightRef: this.alignKR,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    this.cache.valueList('OM002').subscribe((item) => {
      var x = item;
    });
    this.getChartData();
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

  //#region Chart
  getChartData() {
    let krDetail = this.dataKR;
    switch (krDetail.interval) {
      case 'Y':
        this.getCheckInsByYear(krDetail);
        break;
      case 'Q':
        this.getCheckInsByQuarter(krDetail);
        break;
      case 'M':
        this.getCheckInsByMonth(krDetail);
        break;
    }
  }

  getCheckInsByYear(data: any) {
    const checkIns = data.checkIns;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    if (checkIns && checkIns.length > 0) {
      checkIns.map((checkIn, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `Q${index + 1}`;
        this.chartData.checkIns.push(tmpCheckIn);
      });
    }
  }

  getCheckInsByQuarter(data: any) {
    const checkIns = data.checkIns;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    if (checkIns && checkIns.length > 0) {
      checkIns.map((checkIn, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `M${index + 1}`;
        this.chartData.checkIns.push(tmpCheckIn);
      });
    }
  }

  getCheckInsByMonth(data: any) {
    const checkIns = data.checkIns;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    if (checkIns && checkIns.length > 0) {
      checkIns.map((checkIn, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `W${index + 1}`;
        this.chartData.checkIns.push(tmpCheckIn);
      });
    }
  }
  //#endregion Chart

  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//
  checkIn(evt: any, kr: any) {
    this.formModelCheckin.entityName = 'OM_OKRs.CheckIns';
    this.formModelCheckin.entityPer = 'OM_OKRs.CheckIns';
    this.formModelCheckin.gridViewName = 'grvOKRs.CheckIns';
    this.formModelCheckin.formName = 'OKRs.CheckIns';
    this.dialogCheckIn = this.callfc.openForm(
      PopupCheckInComponent,
      '',
      800,
      500,
      'OMT01',
      [kr, this.formModelCheckin]
    );
    this.dialogCheckIn.closed.subscribe((res) => {
      if (res && res.event) {
        this.dataKR = res.event;
        this.totalProgress = this.dataKR.progress;
        this.progressHistory.unshift(this.totalProgress);
        this.dataOKR.map((item: any) => {
          if (item.recID == res.event.parentID) {
            item = res.event;
          }
        });
      }
      this.detectorRef.detectChanges();
    });
  }

  calculatorProgress() {
    this.totalProgress = this.dataKR.progress;
    if (this.dataKR?.checkIns) {
      this.dataKR.checkIns = Array.from(this.dataKR?.checkIns).reverse();
      this.krCheckIn = Array.from(this.dataKR?.checkIns);
      this.krCheckIn.forEach((element) => {
        if (this.krCheckIn.indexOf(element) == 0) {
          this.progressHistory.push(this.totalProgress);
        } else {
          this.totalProgress -=
            this.krCheckIn[this.krCheckIn.indexOf(element) - 1].value;
          this.progressHistory.push(this.totalProgress);
        }
      });
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//
  checkinSave() {}

  checkinCancel() {
    this.dialogCheckIn.close();
  }

  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileCount(evt: any) {}

  fileAdded(evt: any) {}

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
