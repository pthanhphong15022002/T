import { Component, Input, OnInit } from '@angular/core';
import {
  FormModel,
  SidebarModel,
  CallFuncService,
  CacheService,
} from 'codx-core';
import moment from 'moment';
import { PopupCustomFieldComponent } from './popup-custom-field/popup-custom-field.component';

// import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
// imports: [NgbRatingModule];
@Component({
  selector: 'codx-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.scss'],
})
export class FieldDetailComponent implements OnInit {
  @Input() dataStep!: any;
  @Input() formModel!: FormModel;
  @Input() titleDefault = '';
  @Input() isUpdate = false;
  @Input() showColumnControl = 1;
  currentRate = 0;
  dtFormatDate: any = [];

  constructor(private callfc: CallFuncService, private cache: CacheService) {
    this.formModel = new FormModel();
    this.formModel.formName = 'DPInstancesStepsFields';
    this.formModel.gridViewName = 'grvDPInstancesStepsFields';
    this.formModel.entityName = 'DP_Instances_Steps_Fields';
    this.cache.valueList('DP0274').subscribe((res) => {
      if (res) this.dtFormatDate = res.datas;
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

  changeFieldMF(e) {
    //đe vậy tính sau
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS102':
          case 'SYS02':
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
    option.zIndex = 1000;
    var dialogFields = this.callfc.openSide(
      PopupCustomFieldComponent,
      obj,
      option
    );
    dialogFields.closed.subscribe((e) => {
      if (e && e?.event) {
        var fields = e?.event;
        fields.forEach((obj) => {
          var idx = this.dataStep.fields.findIndex((x) => x.recID == obj.recID);
          if (idx != -1) this.dataStep.fields[idx].dataValue = obj.dataValue;
        });
      }
    });
  }

  partNum(num): number {
    return Number.parseInt(num);
  }

  fomatvalue(df) {
    //xu ly tam
    var index = this.dtFormatDate.findIndex((x) => x.value == df);
    if (index == -1) return '';
    return this.dtFormatDate[index]?.text;
  }
  getFormatTime(dv) {
    if (!dv) return '';
    var arrTime = dv.split(':');
    return moment(new Date())
      .set({ hour: arrTime[0], minute: arrTime[1] })
      .toDate();
  }
  formatNumber(dt){
    if(!dt.dataValue) return ''
    if(dt.dataFormat=='I') return Number.parseFloat(dt.dataValue).toFixed(0) ;
    return Number.parseFloat(dt.dataValue).toFixed(2) ;
  }
}
