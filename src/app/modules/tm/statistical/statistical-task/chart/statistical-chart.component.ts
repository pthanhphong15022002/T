import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartTaskRemind, TaskRemind } from '@modules/tm/models/dashboard.model';
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-statistical-chart',
  templateUrl: './statistical-chart.component.html',
  styleUrls: ['./statistical-chart.component.scss']
})
export class StatisticalChartComponent implements OnInit, AfterViewInit {
  @Input() data = [];

  chartTaskRemind: ChartTaskRemind = new ChartTaskRemind();
  @ViewChild('dashboard') dashboard: TemplateRef<any>;

  taskRemind: TaskRemind = new TaskRemind();
  views: Array<ViewModel> = [];

  model= new DataRequest();
  user: any;
  doughnutData = [];
  doughnutEmpty = [
    { label: '', value: 100 },
  ];
  public ngUnsubscribe = new Subject<void>();

  constructor(private api: ApiHttpService, private changeDetectorRef: ChangeDetectorRef, private authStore: AuthStore, private route: ActivatedRoute) { }
  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.dashboard
      }
    }];
    this.getGenaralData();

  }

  ngOnInit(): void {
    console.log(this.route.snapshot.params["funcID"]);
    this.user = this.authStore.get();
    this.model = new DataRequest();
    this.model.formName = "Tasks";
    this.model.gridViewName = "grvTasks";
    this.model.entityName = "TM_Tasks";
    this.model.pageLoading = false;
    this.doughnutData = this.doughnutEmpty;
  }

  getGenaralData() {
    this.api
      .exec("TM", "ReportBusiness", "GetGenaralDataAsync", [
        this.model,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: TaskRemind) => {
        this.taskRemind = data;
        this.setDataChart(data.chartData);

      });
  }

  setDataChart(data: any) {
    this.chartTaskRemind = data.chartTaskRemind;

  }
}
