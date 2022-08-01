import { I } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';
import { getDateCount, getDaysCount } from '@syncfusion/ej2-angular-schedule';
import { ApiHttpService, CallFuncService } from 'codx-core';
import { CodxEsService } from '../codx-es.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private esService: CodxEsService,
    private callFunc: CallFuncService,
    private df: ChangeDetectorRef,
    private api: ApiHttpService
  ) {}
  @ViewChild('default_dashboard') public dashboard: DashboardLayoutComponent;

  public cellSpacing: number[] = [10, 10];
  docsApproveStatus;
  categoriesDocs;
  docsByDays;

  ngOnInit(): void {
    // this.esService.getTotalGByApproveStatus().subscribe((res) => {
    //   this.docsApproveStatus = res;
    //   this.df.detectChanges();
    // });
    // this.esService.getTotalGByCategory().subscribe((res) => {
    //   this.categoriesDocs = res;
    //   this.df.detectChanges();
    // });
    // this.esService.getDocsGByDays().subscribe((res) => {
    //   this.docsByDays = res;
    //   this.df.detectChanges();
    // });
    // if (!this.docsByDays) {
    //   let result: Object[] = [];
    //   for (let i = 1; i < 30; i++) {
    //     result.push({ day: i, docs: 0 });
    //   }
    //   this.docsByDays = result;
    // }
  }

  public data: Object[] = [
    { x: 'ESP', y: 21, text: '21%' },
    { x: 'HCS', y: 8, text: '8%' },
    { x: 'BSC', y: 9, text: '9%' },
    { x: 'DCS', y: 4, text: '4%' },
  ];

  public dataLabel: Object = {
    visible: true,
    position: 'Outside',
    name: '${point.y}',
    font: {
      color: 'white',
      fontWeight: 'Bold',
      size: '14px',
    },
  };

  public legendSettings: Object = {
    visible: true,
    toggleVisibility: false,
    position: 'Right',
    height: '28%',
    width: '50%',
    textWrap: 'Wrap',
    maximumLabelWidth: 100,
  };

  // public marker: Object = { dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600', color: '#ffffff' } } }
  public radius: Object = {
    bottomLeft: 10,
    bottomRight: 10,
    topLeft: 10,
    topRight: 10,
  };
  public line_Data: Object[] = [
    { x: 'Egg', y: 106, text: 'Bangaladesh' },
    { x: 'Fish', y: 103, text: 'Bhutn' },
    { x: 'Misc', y: 198, text: 'Nepal' },
    { x: 'Tea', y: 189, text: 'Thiland' },
  ];

  primaryXAxis = {
    min: 1,
    max: 30,
    valueType: 'Category',
  };
}
