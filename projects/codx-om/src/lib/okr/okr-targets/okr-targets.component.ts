import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CacheService,
  CallFuncService,
  SidebarModel,
  FormModel,
  DialogModel,
  ApiHttpService,
} from 'codx-core';
import { ChartSettings } from '../../model/chart.model';
import { OKRs } from '../../model/okr.model';
import { PopupAddKRComponent } from '../../popup/popup-add-kr/popup-add-kr.component';
import { PopupKRWeightComponent } from '../../popup/popup-kr-weight/popup-kr-weight.component';
import { PopupShowKRComponent } from '../../popup/popup-show-kr/popup-show-kr.component';
import { OkrAddComponent } from '../okr-add/okr-add.component';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.css'],
})
export class OkrTargetsComponent implements OnInit {
  @Input() dataOKRPlans: any;
  @Input() dataOKR: any;
  @Input() formModel: any;
  @Input() gridView: any;
  dtStatus = [];
  openAccordion = [];

  formModelKR = new FormModel();

  chartSettings: ChartSettings = {
    title: '',
    primaryXAxis: {
      valueType: 'Category',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift',
    },
    primaryYAxis: {
      minimum: 0,
      maximum: 100,
      interval: 20,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 },
      minorTickLines: { width: 0 },
    },
    seriesSetting: [
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'OKRBusiness',
    method: 'GetChartDataAsync',
  };

  chartSettings1: ChartSettings = {
    title: '15 Objectives',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'name',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'OKRBusiness',
    method: 'GetChartData1Async',
  };

  chartSettings2: ChartSettings = {
    title: '15 KRs',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'name',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'OKRBusiness',
    method: 'GetChartData1Async',
  };
  funcID: any;

  constructor(
    private callfunc: CallFuncService, 
    private cache: CacheService,
    private activatedRoute:ActivatedRoute,
  ) 
  {
    
  this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    this.progress = this.dataOKRPlans?.progress;
    this.api
      .exec('OM', 'OKRBusiness', 'GetOKRByPlanRAsync', [
        this.dataOKRPlans?.periodID,
      ])
      .subscribe((res) => {
        res
      });
    this.cache.valueList('OM002').subscribe((item) => {
      if (item?.datas) this.dtStatus = item?.datas;
    });
    // Tạo FormModel cho OKRs
    this.formModelKR.entityName = 'OM_OKRs';
    this.formModelKR.gridViewName = 'grvOKRs';
    this.formModelKR.formName = 'OKRs';
    this.formModelKR.entityPer = 'OM_OKRs';
  }
  //Lấy danh sách kr của mục tiêu
  getItemOKR(i: any, recID: any) {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }

  clickMF(e: any) {
    var funcID = e?.functionID;
    switch (funcID) {
      case 'SYS03': {
        let dialog = this.callfunc.openSide(OkrAddComponent, [
          this.gridView,
          this.formModel,
        ]);
        break;
      }
    }
  }
  // Thêm/sửa  KR
  addKR(o: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.formModel;

    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [null, o, this.formModelKR, true, 'Thêm mới kết quả chính',this.funcID],
      option
    );
  }

  editKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.formModel;

    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [kr, o, this.formModelKR, false, popupTitle ,this.funcID],
      option
    );
  }

  clickKRMF(e: any, kr: any, o: any) {
    let popupTitle = e.text + ' kết quả chính';
    var funcID = e?.functionID;
    switch (funcID) {
      case 'SYS03': {
        this.editKR(kr, o, popupTitle);
        break;
      }
    }
  }

  //Xem chi tiết KR
  showKR(kr: any, o: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfunc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [kr, o],
      '',
      dModel
    );
  }
  //Sửa trọng số KR
  editKRWeight(o: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfunc.openForm(
      PopupKRWeightComponent,
      '',
      null,
      null,
      null,
      [o],
      '',
      dModel
    );
  }
}
