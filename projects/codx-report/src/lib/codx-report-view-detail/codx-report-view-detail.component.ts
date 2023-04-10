
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, DialogModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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
  funcID:any;
  predicate:any = "";
  dataValue:any="";
  print:any="false";
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
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
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
    this.changeDetectorRef.detectChanges();
  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
    this.viewBase.moreFuncs = this.moreFc;
  }

  onActions(e:any){
    if(e.type == 'detail'){
      debugger
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
}
