import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ButtonModel, DialogModel, CallFuncService } from 'codx-core';
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

  buttonAddKR: ButtonModel;
  buttonAddO: ButtonModel;
  button?: ButtonModel;
  @Output() click = new EventEmitter<any>();
  date = new Date();
  ops = ['m','q','y'];
  okrPlan:any;
  okrChild:any;
  constructor(    
    private callfunc: CallFuncService,
  ) { }

  ngOnInit(): void {
    
    
    this.button = {
      id: 'btnAdd',
      icon:'icon-i-chevron-down',
      formName:'OKRPlans',
      items:[
        {
          text:'Thêm mục tiêu',
          id:'btnAddO',
          
        },
        {
          text:'Thêm kết quả',
          id:'btnAddKR',
        }
      ]
    };
  }
  buttonClick(event:any)
  {
    this.click.emit(event);
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

  editWeight(okr: any, child:any) {
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
      [okr, child,popupTitle , subTitle ],
      '',
      dModel
    );
  }
}
