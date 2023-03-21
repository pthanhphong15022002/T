import { title } from 'process';
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
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';
import { PopupDistributeOKRComponent } from '../popup-distribute-okr/popup-distribute-okr.component';
import { OMCONST } from '../../codx-om.constant';
import { PopupAddKRComponent } from '../popup-add-kr/popup-add-kr.component';

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
  openAccordionAlign = [];
  openAccordionAssign = [];
  dataKR: any;
  title='';
  krRecID:any;
  krParentID:any;
  progressHistory = [];
  krCheckIn = [];
  listAlign=[];
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
  isCollapsed=false;

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
    this.krRecID=dialogData.data[0];
    this.title = dialogData.data[1];
    this.krParentID = dialogData.data[2];
    this.headerText = dialogData?.data[3];
    this.groupModel = dialogData?.data[4];
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
    
    this.getKRData();    
    this.getListAlign();
    this.getListAssign()
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  getKRData(){
    this.codxOmService
        .getOKRByID(this.krRecID)
        .subscribe((res: any) => {
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
  getListAlign(){
    this.codxOmService
        .getListAlignAssign(this.krParentID, OMCONST.VLL.RefType_Link.Align)
        .subscribe((res: any) => {
          if (res) {
            this.listAlign = res;           
          }
        });
  }
  getListAssign(){
    this.codxOmService
        .getListAlignAssign(this.krParentID, OMCONST.VLL.RefType_Link.Assign)
        .subscribe((res: any) => {
          if (res) {
            this.listAssign = res;           
          }
        });
  }
  getItemOKRAlign(i: any, recID: any) {
    this.openAccordionAlign[i] = !this.openAccordionAlign[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }
  getItemOKRAssign(i: any, recID: any) {
    this.openAccordionAssign[i] = !this.openAccordionAssign[i];
  }
  collapeKR(collapsed: boolean) {
    this.collapedData(this.listAlign,collapsed);
    this.collapedData(this.listAssign,collapsed);
    
    this.isCollapsed = collapsed;
  }
  collapedData(data:any,collapsed:any){
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

  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//
  // checkIn(evt: any, kr: any) {
  //   this.formModelCheckin.entityName = 'OM_OKRs.CheckIns';
  //   this.formModelCheckin.entityPer = 'OM_OKRs.CheckIns';
  //   this.formModelCheckin.gridViewName = 'grvOKRs.CheckIns';
  //   this.formModelCheckin.formName = 'OKRs.CheckIns';
  //   this.dialogCheckIn = this.callfc.openForm(
  //     PopupCheckInComponent,
  //     '',
  //     800,
  //     500,
  //     'OMT01',
  //     [kr, this.formModelCheckin]
  //   );
  //   this.dialogCheckIn.closed.subscribe((res) => {
  //     if (res && res.event) {
  //       this.dataKR = res.event;
  //       this.totalProgress = this.dataKR.progress;
  //       this.progressHistory.unshift(this.totalProgress);
  //       this.dataKR.map((item: any) => {
  //         if (item.recID == res.event.parentID) {
  //           item = res.event;
  //         }
  //       });
  //     }
  //     this.detectorRef.detectChanges();
  //   });
  // }
  checkIn(kr: any) {
    let popupTitle= 'Cập nhật tiến độ';
    let dialogCheckIn = this.callfc.openForm(
      PopupCheckInComponent,
      '',
      800,
      500,
      '',
      [kr, popupTitle, { ...this.groupModel?.checkInsModel }]
    );
    dialogCheckIn.closed.subscribe((res) => {
      if (res && res.event) {
      }
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

  editKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModel;

    let dialogKR = this.callfc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Edit, popupTitle, o, kr],
      option
    );
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
