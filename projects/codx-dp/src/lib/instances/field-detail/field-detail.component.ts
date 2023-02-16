import { Component, Input, OnInit } from '@angular/core';
import {
  FormModel,
  SidebarModel,
  CallFuncService,
  CacheService,
} from 'codx-core';
import { PopupCustomFieldComponent } from '../popup-custom-field/popup-custom-field.component';
// import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
// imports: [NgbRatingModule];
@Component({
  selector: 'codx-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.scss'],
})
export class FieldDetailComponent implements OnInit {
  @Input() dataStep: any;
  @Input() formModel: any;
  @Input() titleDefault :string=''
  currentRate = 0;
  dtFormatDate :any =[]

  constructor(private callfc: CallFuncService, private cache: CacheService) {
    this.cache.valueList('DP0274').subscribe(res=>{
      if(res)this.dtFormatDate = res.datas
    
    });
  }

  ngOnInit(): void {
    this.currentRate = 8;
  }

  clickShow(e, id) {
    let children = e.currentTarget.children[0];
    let element = document.getElementById(id);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        children.classList.add('icon-expand_less');
        children.classList.remove('icon-expand_more');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        children.classList.remove('icon-expand_less');
        children.classList.add('icon-expand_more');
      }
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS03':
        this.popupCustomField(data);
        break;
    }
  }
  popupCustomField(data) {
    var list = [];
    if (data && data.length > 0) {
      list = data;
    } else {
      list.push(data);
    }
    var obj = { data: list };
    let formModel: FormModel = {
      entityName: 'DP_Instances_Steps_Fields',
      formName: 'DPInstancesStepsFields',
      gridViewName: 'grvDPInstancesStepsFields',
    };
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    option.zIndex = 1010;
    let field = this.callfc.openSide(PopupCustomFieldComponent, obj, option);
  }

  partNum(num) {
    return Number.parseInt(num);
  }
  rateChange(e) {}

  fomatvalue(dt) {
    //xu ly tam
    var fm = this.dtFormatDate.findIndex(x=>x.value==dt)
    return fm?.text;
  }
}
