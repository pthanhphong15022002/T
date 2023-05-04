import { Component, Injector } from '@angular/core';
import { LayoutService, PageTitleService, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent extends UIComponent{
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
      this.codxService.navigate('', 'od/report/detail/' + e.data.reportID);
    }
  }
  viewChanged(e:any){
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }
}
