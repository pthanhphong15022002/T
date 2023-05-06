
import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, DialogModel, LayoutService, PageTitleService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupAddReportComponent } from '../popup-add-report/popup-add-report.component';

@Component({
  selector: 'codx-report-view-detail',
  templateUrl: './codx-report-view-detail.component.html',
  styleUrls: ['./codx-report-view-detail.component.scss']
})
export class CodxReportViewDetailComponent   extends UIComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('report') report:TemplateRef<any>;
  @ViewChild('view') viewBase:ViewsComponent;
  onInit(): void {
  }

   views: ViewModel[];
  viewType = ViewType;
  @Input() funcID:any;
  @Input() predicate:any = "";
  @Input() dataValue:any="";
  @Input() print:any="false";
  _paramString:any="";
  moreFc: any = [
    {
      id: 'btnAddReport',
      icon: 'icon-list-chechbox',
      text: 'Thêm/Sửa report',
    },
  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        reportView: true,
        reportType:'R',
        text: 'Report',
        icon: 'icon-assignment',
        model: {
          panelLeftRef:this.report
        },
      },
      // {
      //   type: ViewType.list,
      //   sameData: true,
      //   active: false,

      //   // model: {
      //   //   template: ,
      //   // },
      // },
    ];
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
    this.changeDetectorRef.detectChanges();
  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
    this.viewBase.moreFuncs = this.moreFc;


  }

  onActions(e:any){
    if(e.type == 'detail'){
    }
  }

  click(event: any){
    switch(event.id){
      case 'btnAddReport':
        this.editReport();
        break;
    }
  }

  private editReport() {
    let option = new DialogModel();
    option.DataService = this.viewBase.dataService;
    option.FormModel = this.viewBase.formModel;
    this.callfc.openForm(
      PopupAddReportComponent,
      '',
      screen.width,
      screen.height,
      this.funcID,
      this.funcID,
      '',
      option
    );
  }

  filterReportChange(e:any){
    // if(e[0]){
    //   debugger
    //   this.predicate = e[0].predicates;
    //   this.dataValue = e[0].dataValues;
    // }
    let objParam:any = {};
    if(e[1]){
      for(let key in e[1]){
        // if(key.includes('Date')){
        //   objParam['fromDate'] = e[1][key].fromDate;
        //   objParam['toDate'] = e[1][key].toDate;
        // }
        // else{
        //   objParam[key] = e[1][key]
        // }
        objParam[key] = e[1][key]
      }
      this._paramString = JSON.stringify(objParam);
    }
  }
}
