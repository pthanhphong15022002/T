import { Component, Input, OnInit } from '@angular/core';
import { FormModel, SidebarModel, CallFuncService } from 'codx-core';
import { PopupCustomFieldComponent } from '../popup-custom-field/popup-custom-field.component';

@Component({
  selector: 'codx-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.scss'],
})
export class FieldDetailComponent implements OnInit {
  @Input() lstSteps: any;
  @Input() lstFields: any;
  @Input() formModel: any;
  @Input() isUpdate = false;
  constructor(private callfc: CallFuncService) {}

  ngOnInit(): void {}

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

  changeFieldMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS104':
          case 'SYS04':
          case 'SYS102':
          case 'SYS02':
          case 'SYS005':
          case 'SYS003':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'DP011':
          case 'DP02':
          case 'DP09':
          case 'DP10':
            res.disabled = true;
            break;
          //edit
          case 'SYS103':
          case 'SYS03':
              if (!this.isUpdate) res.disabled = true;
              break;
        }
      });
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

   partNum(num){
   return Number.parseInt(num) ;
   }
   rateChange(e){}
}
