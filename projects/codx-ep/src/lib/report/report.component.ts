import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { LayoutService, PageTitleService, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'report-stationery',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class EPReportComponent extends UIComponent {
  views: Array<ViewModel> = [];
  viewType = ViewType;
  funcID: string;

  constructor(injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.report,
        active: true,
        reportView: true,
        reportType: 'R',

      },
    ];
    this.detectorRef.detectChanges();
  }

  onActions(e: any) {
    if (e.type == 'detail') {
      this.codxService.navigate('', 'ep/report/detail/' + e.data.reportID);
    }
  }
  viewChanged(e:any){
    debugger
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }
}
