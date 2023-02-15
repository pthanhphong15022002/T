import {
  Component,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AuthStore,
  DataRequest,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'assigndashboard',
  templateUrl: './assigndashboard.component.html',
  styleUrls: ['./assigndashboard.component.scss'],
})
export class AssignDashboardComponent extends UIComponent {
  @ViewChild('content') content: TemplateRef<any>;
  @ViewChildren('assign_dashboard') templates: QueryList<any>;
  views: Array<ViewModel> = [];
  model: DataRequest;

  chartSettings1: ChartSettings = {
    title: '15 Objectives',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
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
    className: 'DashBoardBusiness',
    method: 'GetChartData1Async',
  };

  chartSettings2: ChartSettings = {
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
  };

  panels = [];
  datas = [];
  funcID: any;
  user: any;
  dataSource: any;
  topEmp = []

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.model.predicate = 'Owner = @0';
    this.model.dataValue = this.user.userID;
    this.model.predicates = 'Category = @0';
    this.model.dataValues = '3';
  }

  onInit(): void {
    this.panels = JSON.parse(
      '[{"id":"0.523457964441643_layout","row":0,"col":0,"sizeX":23,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.31840880843740593_layout","row":2,"col":0,"sizeX":7,"sizeY":8,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7510647884478909_layout","row":2,"col":7,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.3589282977118571_layout","row":2,"col":15,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.04560048135185002_layout","row":6,"col":7,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.019371191380587183_layout","row":6,"col":15,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.523457964441643_layout","data":"1"},{"panelId":"0.31840880843740593_layout","data":"2"},{"panelId":"0.7510647884478909_layout","data":"3"},{"panelId":"0.3589282977118571_layout","data":"4"},{"panelId":"0.04560048135185002_layout","data":"5"},{"panelId":"0.019371191380587183_layout","data":"6"}]'
    );
    this.getGeneralData();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.content,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  private getGeneralData() {
    this.tmService.getAssignDBData(this.model).subscribe((res: any) => {
      if (res) {
        this.detectorRef.detectChanges();
      }
    });
  }
}
