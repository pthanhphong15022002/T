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
import { PopupOKRWeightComponent } from '../popup-okr-weight/popup-okr-weight.component';
import { TabModelSprints } from 'projects/codx-tm/src/lib/models/TM_Sprints.model';
import { OM_TabModel } from '../../model/okr.model';

@Component({
  selector: 'popup-show-ob',
  templateUrl: 'popup-show-ob.component.html',
  styleUrls: ['popup-show-ob.component.scss'],
})
export class PopupShowOBComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  formModelCheckin = new FormModel();
  dtStatus: any;
  dataOKR: any;
  openAccordionAlign = [];
  openAccordionAssign = [];
  dataOB: any;
  progressHistory = [];
  krCheckIn = [];
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;

  activeTab = 'Overview';
  tabControl = [
    {
      name: 'Overview',
      textDefault: 'Tổng quan',
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
  okrChild = [];
  listAlign = [];
  listAssign = [];
  isCollapsed = true;
  okrFM: any;
  oldOB: any;
  popupTitle = '';
  okrVll: any;
  isHiddenChart = true;
  okrGrv: any;
  offset: string;
  active: any;
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
    this.dialogRef = dialogRef;
    this.oldOB = dialogData.data[0];
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
    this.getObjectData();
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
    this.activeTab = 'Overview';
    if (this.activeTab == 'Tasks') this.offset = '65px';
    else this.offset = '0px';
    this.detectorRef.detectChanges();
  }

  getObjectData() {
    this.codxOmService
      .getObjectAndKRChild(this.oldOB?.recID)
      .subscribe((res: any) => {
        if (res) {
          this.dataOKR = res;
          this.okrChild = res.items;
          this.detectorRef.detectChanges();
        }
      });
  }
  getListAlign() {
    this.codxOmService.getListAlign(this.oldOB?.recID).subscribe((res: any) => {
      if (res) {
        this.listAlign = res;
      }
    });
  }
  getListAssign() {
    this.codxOmService
      .getListAssign(this.oldOB?.recID)
      .subscribe((res: any) => {
        if (res) {
          this.listAssign = res;
        }
      });
  }
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
    if (this.activeTab == 'Tasks') this.offset = '65px';
    else this.offset = '0px';
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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
