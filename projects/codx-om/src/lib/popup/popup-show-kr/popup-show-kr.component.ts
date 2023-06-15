import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  GaugeTheme,
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
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';

@Component({
  selector: 'popup-show-kr',
  templateUrl: 'popup-show-kr.component.html',
  styleUrls: ['popup-show-kr.component.scss'],
})
export class PopupShowKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  formModelCheckin = new FormModel();
  dtStatus: any;
  openAccordionAlign = [];
  openAccordionAssign = [];
  dataKR: any;
  progressHistory = [];
  krCheckIn = [];
  listAlign = [];

  offset: string;
  activeTab = 'CheckIns';
  tabControl = [
    {
      name: 'CheckIns',
      textDefault: 'Check-In',
      isActive: true,
      icon: 'icon-i-bullseye',
    },
    {
      name: 'Links',
      textDefault: 'Liên kết',
      isActive: false,
      icon: 'icon-account_tree',
    },
    {
      name: 'Tasks',
      textDefault: 'Công việc',
      isActive: false,
      icon: 'icon-format_list_numbered',
    },
    {
      name: 'Comments',
      textDefault: 'Ghi chú',
      isActive: false,
      icon: 'icon-i-chat',
    },
    {
      name: 'History',
      textDefault: 'Cập nhật',
      isActive: false,
      icon: 'icon-history',
    },
  ];
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
  listAssign: any;
  groupModel: any;
  isCollapsed = false;
  okrFM: any;
  oldKR: any;
  popupTitle: any;
  okrVll: any;
  isHiddenChart = false;
  okrGrv: any;

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
    this.dialogRef = dialogRef;
    this.oldKR = dialogData.data[0];
    this.popupTitle = dialogData?.data[1];
    this.okrFM = dialogData?.data[2];
    this.okrVll = dialogData?.data[3];
    this.okrGrv = dialogData?.data[4];
    this.formModel = dialogRef.formModel;
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getKRData();
    this.getListAlign();
    this.getListAssign();
    this.loadTabView();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  loadTabView() {
    this.activeTab = 'CheckIns';
    if (this.activeTab == 'Tasks') this.offset = '65px';
    else this.offset = '0px';
    this.detectorRef.detectChanges();
  }
  getKRData() {
    this.codxOmService.getOKRByID(this.oldKR.recID).subscribe((res: any) => {
      if (res) {
        this.dataKR = res;
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
        this.getChartData();
        this.detectorRef.detectChanges();
      }
    });
  }
  getListAlign() {
    this.codxOmService.getListAlign(this.oldKR?.recID).subscribe((res: any) => {
      if (res) {
        this.listAlign = res;
      }
    });
  }
  getListAssign() {
    this.codxOmService
      .getListAssign(this.oldKR?.recID)
      .subscribe((res: any) => {
        if (res) {
          this.listAssign = res;
        }
      });
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
    const targets = data.targets;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    let tempTarget = 0;

    if (!targets) {
      return;
    }

    if (checkIns && checkIns.length > 0) {
      targets.map((target, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `Q${index + 1}`;
        tempTarget = tempTarget + (target.target / data.target) * 100;
        tmpCheckIn.target = tempTarget;
        this.chartData.data.push(tmpCheckIn);
      });
    }
  }

  getCheckInsByQuarter(data: any) {
    const checkIns = data.checkIns;
    const targets = data.targets;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    let tempTarget = 0;

    if (!targets) {
      return;
    }

    if (checkIns && checkIns.length > 0) {
      targets.map((target, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `M${index + 1}`;
        tempTarget = tempTarget + (target.target / data.target) * 100;
        tmpCheckIn.target = tempTarget;
        this.chartData.data.push(tmpCheckIn);
      });
    }
  }

  getCheckInsByMonth(data: any) {
    const checkIns = data.checkIns;
    const targets = data.targets;
    const progressHistory = this.progressHistory;
    const progressHistoryReverse = [...progressHistory].reverse();
    let tempTarget = 0;

    if (!targets) {
      return;
    }

    if (checkIns && checkIns.length > 0) {
      targets.map((target, index) => {
        let tmpCheckIn: any = {};
        tmpCheckIn.percent = progressHistoryReverse[index];
        tmpCheckIn.period = `W${index + 1}`;
        tempTarget = tempTarget + (target.target / data.target) * 100;
        tmpCheckIn.target = tempTarget;
        this.chartData.data.push(tmpCheckIn);
      });
    }
  }
  //#endregion Chart

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  clickMenu(item) {
    this.activeTab = item.name;
    for (let i = 0; i < this.tabControl.length; i++) {
      if (this.tabControl[i].isActive == true) {
        this.tabControl[i].isActive = false;
      }
    }
    item.isActive = true;
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  hiddenChartClick(evt: any) {
    this.isHiddenChart = evt;
    this.detectorRef.detectChanges();
  }
  closeDialog() {
    this.dialogRef && this.dialogRef.close();
  }
  collapeKR(collapsed: boolean) {
    this.collapedData(this.listAlign, collapsed);
    this.collapedData(this.listAssign, collapsed);

    this.isCollapsed = collapsed;
  }
  collapedData(data: any, collapsed: any) {
    data.forEach((ob) => {
      ob.isCollapse = collapsed;
    });
    this.detectorRef.detectChanges();
    data.forEach((ob) => {
      if (ob.items != null && ob.items.length > 0) {
        ob.items.forEach((kr) => {
          kr.isCollapse = collapsed;
        });
      }
    });
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
