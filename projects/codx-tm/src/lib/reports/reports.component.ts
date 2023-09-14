import { Component, Injector, ViewChild } from '@angular/core';
import { ButtonModel, CacheService, DialogModel, LayoutService, PageTitleService, UIComponent, ViewModel, ViewReportDesignerComponent, ViewType, ViewsComponent } from 'codx-core';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';

@Component({
  selector: 'lib-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent extends UIComponent {
  @ViewChild('view') viewBase:ViewsComponent;
  views: Array<ViewModel> = [];
  viewType = ViewType;
  button:ButtonModel = {
    id:'btnAdd',

  }
  module:any='';
  constructor(injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private cacheSv:CacheService) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.cacheSv.functionList(this.funcID).subscribe((res:any)=>{
      if(res){
        this.module = res.module ? res.module.toLowerCase() : '';
      }
    })
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
      this.codxService.navigate('', this.module+'/report/detail/' + e.data.reportID);
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
