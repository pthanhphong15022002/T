import {
  Component,
  Injector,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';

@Component({
  selector: 'app-tmdashboard',
  templateUrl: './tmdashboard.component.html',
  styleUrls: ['./tmdashboard.component.scss'],
})
export class TMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  funcID: string = '';
  service = 'TM';
  assemblyName = 'ERM.Business.TM';
  className = 'ReportBusiness';
  method = 'ListReportProjectAsync';
  viewType = ViewType;
  views: Array<ViewModel> = [];
  dashboard = [];

  constructor(private inject: Injector) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.loadDashboard();
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

  loadDashboard() {
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetFuncByPredicateAsync', [
        'ParentID=@0',
        this.funcID,
        'VN',
      ])
      .subscribe((res: any) => {
        if (res) {
          this.dashboard = res;
          this.view.dataService.add(res).subscribe();
        }
      });
  }

  loadContent(evt: any, item: any) {
    let url = item.url.substring(0, item.url.lastIndexOf('/'));
    this.codxService.navigate(item.functionID, url);
  }
}
