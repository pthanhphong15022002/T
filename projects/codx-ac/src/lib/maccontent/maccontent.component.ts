import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'lib-maccontent',
  templateUrl: './maccontent.component.html',
  styleUrls: ['./maccontent.component.css'],
})
export class MACContentComponent extends UIComponent {
  views: Array<ViewModel> = [];
  VllOption: any[] = [
    {
      value: 'P',
      text: 'Kỳ',
      default: 'Kỳ',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'Q',
      text: 'Quý',
      default: 'Quý',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'Y',
      text: 'Năm',
      default: 'Năm',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'D',
      text: 'Ngày',
      default: 'Ngày',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
  ];
  //Q1;Quí một;Q2;Quí hai;Q3;Quí ba;Q4;Quí bốn
  Quater: any[] = [
    {
      value: 'Q1',
      text: 'Quí một',
      default: 'Quí một',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'Q2',
      text: 'Quí hai',
      default: 'Quí hai',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'Q3',
      text: 'Quí ba',
      default: 'Quí ba',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
    {
      value: 'Q4',
      text: 'Quí bốn',
      default: 'Quí bốn',
      color: null,
      textColor: null,
      icon: null,
      idx: '0',
    },
  ];
  type: 'P' | 'Q' | 'Y' | 'D' = 'P';
  periodID: string = '';
  quaterID: string = '';
  fromDate: string = '';
  toDate: string = '';
  refValue: string = 'FiscalPeriods';

  @ViewChild('template') template: TemplateRef<any>;
  constructor(private inject: Injector) {
    super(inject);
  }

  onInit(): void {}
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.template,
          widthLeft: '100%',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.view = view;
  }

  clickclick(evt: any, btn: any) {
    if (btn) {
      btn.ComponentCurrent?.setValue('2307070011');
    }
  }

  select(evt: any) {
    console.log(evt);
    if (evt.itemData) this.quaterID = evt.itemData['value'];
  }

  valueChange(evt: any) {
    let field = evt.field;
    let value = evt.data;
    if (value && value.fromDate)
      value = moment(value.fromDate).format('yyyy/MM/DD');
    this[field] = value;
  }

  changeType(evt: any) {
    this.fromDate = '';
    this.toDate = '';
    this.quaterID = '';
    this.periodID = '';
    let field = evt.field;
    let value = evt.data;
    if (value) this.type = field;
    if (this.type == 'Y' || this.type == 'Q') this.refValue = 'FiscalYears';
    else this.refValue = '';

    this.detectorRef.detectChanges();
  }

  refreshData() {
    // let period = this.periodID;
    // if (this.type == 'D') {
    //   period = this.fromDate + '' + '-' + this.toDate + '';
    // } else if (this.type == 'Q')
    //   period = this.periodID + '' + '/' + this.quaterID + '';
    let obj: any = {};
    obj['procName'] = '';
    obj['dataValue'] = [];
    obj['params'] = {
      sFunctionID: this.view.funcID,
      sType: this.type,
      sFromDate: this.fromDate,
      sToDate: this.toDate,
      sPeriodID: this.periodID,
      sQuaterID: this.quaterID,
    };

    this.api
      .execSv(
        'rptac',
        'Codx.RptBusiness.AC',
        'MACBusiness',
        'GetReportSourceAsync',
        [obj]
      )
      .subscribe((res: any) => {
        console.log(res);
      });
  }
}
