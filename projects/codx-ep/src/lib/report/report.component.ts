import { Component, Injector, ViewChild } from '@angular/core';
import { ButtonModel, DialogModel, LayoutService, PageTitleService, UIComponent, ViewModel, ViewReportDesignerComponent, ViewsComponent, ViewType } from 'codx-core';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';

@Component({
  selector: 'report-stationery',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  //encapsulation:ViewEncapsulation.None,
})
export class EPReportComponent extends UIComponent {
  @ViewChild('view') viewBase:ViewsComponent;
  views: Array<ViewModel> = [];
  viewType = ViewType;
  funcID: string;
  button:ButtonModel = {
    id:'btnAdd',

  }
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
        showFilter:false,
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
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }

  buttonClick(e:any){
    if(e.id == 'btnAdd'){
      let option = new DialogModel;
      option.IsFull = true;
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase.formModel;
     let dialog = this.callfc.openForm(PopupAddReportComponent,"",0,0,this.funcID,{rootFunction:this.funcID},"",option);
     dialog.closed.subscribe((res:any)=>{
      (this.viewBase.currentView as ViewReportDesignerComponent).loadReports();
     })
    }
  }
}
