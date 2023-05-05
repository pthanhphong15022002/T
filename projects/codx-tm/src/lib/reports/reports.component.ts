import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { CodxService, LayoutService, PageTitleService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxTMService, LayoutModel } from '../codx-tm.service';

@Component({
  selector: 'lib-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent extends UIComponent {
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
      this.codxService.navigate('', 'tm/report/detail/' + e.data.reportID);
    }
  }
  viewChanged(e:any){
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }

}
