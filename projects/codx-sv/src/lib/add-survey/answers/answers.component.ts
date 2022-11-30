import { Browser } from '@syncfusion/ej2-base';
import {
  Component,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss'],
})
export class AnswersComponent extends UIComponent implements OnInit, OnChanges {
  @Input() formModel: any;
  constructor(private injector: Injector) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['changeModeA']) {
    }
  }

  onInit(): void {}

  public data: Object[] = [
    { Country: '0', GoldMedal: 27 },
    { Country: '2', GoldMedal: 0 },
    { Country: '4', GoldMedal: 8 },
    { Country: '6', GoldMedal: 19 },
    { Country: '8', GoldMedal: 17 },
    { Country: '10', GoldMedal: 2 },
    { Country: '12', GoldMedal: 0 },
    { Country: '14', GoldMedal: 4 },
    { Country: '16', GoldMedal: 0 },
    { Country: '18', GoldMedal: 8 },
    { Country: '20', GoldMedal: 46 },
  ];
  //Initializing Primary X Axis
  public primaryXAxis: Object = {
    valueType: 'Category',
    interval: 1,
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  };
  //Initializing Primary Y Axis
  public primaryYAxis: Object = {
    maximum: 50,
    interval: 10,
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
  };
  public tooltip: Object = {
    enable: true,
    header: '<b>${point.tooltip}</b>',
    format: 'Count : <b>${point.y}</b>',
    shared: true,
    enableMarker: false,
  };
  public chartArea: Object = {
    border: {
      width: 0,
    },
  };
  public width: string = Browser.isDevice ? '100%' : '55%';
}
