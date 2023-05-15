
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore, DialogModel, LayoutService, PageTitleService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupAddReportComponent } from '../popup-add-report/popup-add-report.component';
import { PopupShowDatasetComponent } from '../popup-show-dataset/popup-show-dataset.component';

@Component({
  selector: 'codx-report-view-detail',
  templateUrl: './codx-report-view-detail.component.html',
  styleUrls: ['./codx-report-view-detail.component.scss']
})
export class CodxReportViewDetailComponent   extends UIComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('report') report:TemplateRef<any>;
  @ViewChild('view') viewBase:ViewsComponent;
  @ViewChild('breadCrumb') breadCrumb!:ElementRef<any>;
  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
  }

   views: ViewModel[];
  viewType = ViewType;
  @Input() funcID:any;
  @Input() predicate:any = "";
  @Input() dataValue:any="";
  @Input() print:any="false";
  _paramString:any="";
  orgReportList:any=[];
  moreFc: any = [
    {
      id: 'btnAddReport',
      icon: 'icon-list-chechbox',
      text: 'Thêm/Sửa report',
    },
  ]
  rootFunction:any;
  funcItem:any;
  reportList:any=[];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg:Router,
    private auth : AuthStore
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];


  }
  ngOnDestroy(): void {

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

    this.routerNg.events.subscribe((event: any)=>{
      if(event instanceof NavigationEnd){
        if(event.url.includes('detail')){
          let funcID = event.url.split('/').pop();
          this.funcID = funcID;
          this.pageTitle.setBreadcrumbs([]);
          this.layout.setLogo('');
          this.layout.showIconBack = true;
          this.pageTitle.setTitle('');
          this.pageTitle.setSubTitle('')
          //this.funcID = this.router.snapshot.params['funcID'];
          this.getReport(funcID);
        }
        else if(event.url.includes(this.rootFunction.funtionID)){

          this.pageTitle.setTitle(this.rootFunction.customName);
          this.pageTitle.setSubTitle(this.rootFunction.customName);
          this.pageTitle.setBreadcrumbs([]);
        }
        this.changeDetectorRef.detectChanges();
      }
    })


  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
    this.viewBase.moreFuncs = this.moreFc;
    this.pageTitle.setBreadcrumbs([]);
    this.layout.setLogo('');

    if(this.funcID){
      this.getReport(this.funcID);
    }
  }

  onActions(e:any){
    if(e.id == 'btnViewDs'){
      let dialog = new DialogModel;
      dialog.IsFull = true;
      let parameters = this.funcItem.parameters;
      if(parameters){
        parameters.forEach((x:any) => {
          if(x.defaultValue){
            e.parameters[x.mappingName] = x.defaultValue;
          }
        });
      }
      this.callfc.openForm(PopupShowDatasetComponent,"",window.innerWidth,window.innerHeight,"",{report: this.funcItem, parameters: e.parameters},"",dialog)
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
      // let parameters = this.funcItem.parameters;
      // if(parameters){
      //   parameters.forEach((e:any) => {
      //     if(e.defaultValue){
      //       objParam[e.mappingName] = e.defaultValue;
      //     }
      //   });
      // }

      this._paramString = JSON.stringify(objParam);
    }
  }

  getRootFunction(module:string, type:string){
    this.api.execSv("SYS","ERM.Business.SYS","FunctionListBusiness","GetFuncByModuleIDAsync",[module,type]).subscribe((res:any)=>{
      if(res){
        this.rootFunction = res;
      }
    })
  }
  getReport(funcID:string){
    this.api
    .execSv(
      'rptsys',
      'Codx.RptBusiniess.SYS',
      'ReportListBusiness',
      'GetByReportIDAsync',
      funcID
    )
    .subscribe((res: any) => {
      if (res) {
        this.funcItem = res;
        this.setBreadCrumb(this.funcItem);
        this.getRootFunction(this.funcItem.moduleID, this.funcItem.reportType);
        this.getReportList(this.funcItem.moduleID, this.funcItem.reportType);
      }
    });
  }
  setBreadCrumb(func:any){
    if(func){
      let eleHeader = document.querySelector('codx-header');
      if(eleHeader){
        let span = document.createElement('span');
          span.innerHTML = '> '+ this.funcItem.customName;
          let titleEle = eleHeader.querySelector('codx-page-title');
          if(titleEle){
            (titleEle as HTMLElement).style.width ='100%';
            if(!titleEle.querySelector('#breadCrumb'))
              titleEle.appendChild(this.breadCrumb.nativeElement);
          }
      }
    }
  }
  getReportList(moduleID:string,reportType:string){
    this.api.execSv("rptsys",'Codx.RptBusiniess.SYS',"ReportListBusiness","GetReportsByModuleAsync",[reportType,moduleID]).subscribe((res:any)=>{
      this.orgReportList = res;
      this.reportList = this.orgReportList.filter((x:any)=>x.reportID != this.funcItem.reportID);
    })
  }
  itemSelect(e:any){
    if(e){
      this.funcItem = e;
      this.codxService.navigate('', e.moduleID.toLowerCase()+'/report/detail/' + e.reportID);
      this.reportList = this.orgReportList.filter((x:any)=>x.reportID != this.funcItem.reportID);
    }
  }
  homeClick(){
    this.codxService.navigate('', this.rootFunction.module.toLowerCase()+'/report/' + this.rootFunction.functionID);
    this.breadCrumb.nativeElement.remove()
  }
}
