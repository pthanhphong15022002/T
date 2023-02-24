import {
  Component,
  Injector,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType, DataRequest } from 'codx-core';

@Component({
  selector: 'app-tmdashboard',
  templateUrl: './tmdashboard.component.html',
  styleUrls: ['./tmdashboard.component.scss'],
})
export class TMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  dashboard = [];
  funcID: string = 'TMD';
  reportID: string = 'TMD002';

  constructor(inject: Injector) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.reportID = this.router.snapshot.queryParams['reportID'];
  }

  onInit(): void {
    let request = new DataRequest();
    request.funcID = this.funcID;
    request.entityName = 'SYS_FunctionList';
    request.entityPermission = 'TM_DashBoard';
    request.formName = 'TMDashBoard';
    request.predicate = 'ParentID=@0';
    request.dataValue = 'TMD';
    request.page = 1;
    request.pageSize = 20;

    this.loadDashboard(request);
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.template,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  loadDashboard(request: any) {
    this.api
      .execSv('SYS', 'Core', 'DataBusiness', 'LoadDataAsync', request)
      .subscribe((res: any) => {
        if (res) {
          this.dashboard = res[0];
        }
        this.detectorRef.detectChanges();
      });
  }

  loadContent(event: any, item: any) {
    this.api
      .exec('SYS', 'ReportListBusiness', 'GetByReportIDAsync', item.functionID)
      .subscribe((res: any) => {
        if (res) {
          this.reportID = res.reportID;
          this.codxService.navigate('', 'tm/tmdashboard/TMD/' + this.reportID);
        }
      });
  }
}
