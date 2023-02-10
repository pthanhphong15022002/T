import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ButtonModel, DialogModel, CallFuncService } from 'codx-core';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
import { PopupOKRWeightComponent } from '../../popup/popup-okr-weight/popup-okr-weight.component';

@Component({
  selector: 'lib-okr-toolbar',
  templateUrl: './okr-toolbar.component.html',
  styleUrls: ['./okr-toolbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrToolbarComponent implements OnInit {
  @Input() data:any;
  @Input() dataChild:any;
  @Input() formModel:any;
  buttonAddKR: ButtonModel;
  buttonAddO: ButtonModel;
  button?: ButtonModel;
  isHiddenChart=false;
  @Output() hiddenChart=new EventEmitter<any>();
  @Output() click = new EventEmitter<any>();
  date:any = new Date();
  ops = ['m','q','y'];
  okrPlan:any;
  okrChild:any;
  constructor(    
    private callfunc: CallFuncService,
    private codxOmService: CodxOmService,
  ) { }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
      icon:'icon-add',
      formName:'OKRPlans',
      items:[
        {
          text:'Thêm mục tiêu',
          id:'btnAddO',
          
        },
        {
          text:'Thêm kết quả then chốt',
          id:'btnAddKR',
        }
      ]
    };
    this.codxOmService.getSettingValue(OMCONST.OMPARAM).subscribe((omSetting: any) => {
      if (omSetting) {
        let settingVal = JSON.parse(omSetting?.dataValue);
        if(settingVal!=null && (settingVal?.UseSubKR=='1' || settingVal?.UseSubKR==true)){
          this.button =
          {
            id: 'btnAdd',
            icon:'icon-add',
            formName:'OKRPlans',
            items:[
              {
                text:'Thêm mục tiêu',
                id:'btnAddO',
                
              },
              {
                text:'Thêm kết quả then chốt',
                id:'btnAddKR',
              },
              {
                text:'Thêm kết quả then chốt cấp con',
                id:'btnAddSKR',
              }
            ]
          };
        }
        
      }      
    }); 
    
       
  }
  buttonClick(event:any)
  {
    this.click.emit(event);
  }
  hiddenChartClick(hiddenChart:any)
  {
    this.isHiddenChart=hiddenChart;
    this.hiddenChart.emit(hiddenChart);
  }
  changeCalendar(event:any)
  {
    var obj = 
    {
      id : "Calendar",
      data : event
    };
    this.click.emit(obj);
  }
  //Hàm chia sẻ tạm thời
  sharePlan()
  {
    var obj = 
    {
      id : "SharePlan",
    };
    this.click.emit(obj);
  }
  editWeight(planRecID: any) {
    //OM_WAIT: tiêu đề tạm thời gán cứng
    let popupTitle='Thay đổi trọng số cho mục tiêu';
    let subTitle='Trọng số & kết quả thực hiện';
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [planRecID, OMCONST.VLL.OKRType.Obj,popupTitle , subTitle ],
      '',
      dModel
    );
  }
}
