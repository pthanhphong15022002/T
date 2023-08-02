
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService, AuthStore, DialogModel, LayoutService, PageLink, PageTitleService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopupAddReportComponent } from '../popup-add-report/popup-add-report.component';
import { PopupShowDatasetComponent } from '../popup-show-dataset/popup-show-dataset.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'codx-report-view-detail',
  templateUrl: './codx-report-view-detail.component.html',
  styleUrls: ['./codx-report-view-detail.component.scss']
})
export class CodxReportViewDetailComponent   extends UIComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('report') report:TemplateRef<any>;
  @ViewChild('view') viewBase:ViewsComponent;
  @ViewChild('breadCrumb') breadCrumb!:ElementRef<any>;
  

  views: ViewModel[];
  viewType = ViewType;
  mssgSYS043:string = "";
  mssgSYS044:string = "";
  @Input() funcID:any;
  @Input() predicate:any = "";
  @Input() dataValue:any="";
  @Input() print:any="false";
  reportID:string;
  _paramString:any="";
  _labelString:any="";
  orgReportList:any=[];
  moreFc: any = [
    {
      id: 'btnAddReport',
      icon: 'icon-list-chechbox',
      text: 'Thông tin báo cáo',
    },
  ]
  rootFunction:any;
  funcItem:any;
  reportList:any=[];
  user:any = null;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg:Router,
    private auth : AuthStore,
    private authSV : AuthService,
    private apihttp:HttpClient

  ) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params.subscribe((param:any) => {
      this.funcID = param.funcID;
      this.getReport(this.funcID);
    });
    this.getMessageDefault();
  }

  
  ngOnDestroy(): void {
    this.pageTitle.setSubTitle("");
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
      {
        type: ViewType.content,
        sameData: true,
        active: false,

        model: {
          panelLeftRef:this.report
        },
      },
    ];

    this.routerNg.events.subscribe((event: any)=>{
      if(event instanceof NavigationEnd){
        if(event.url.includes('detail')){
          let funcID = event.url.split('/').pop();
          this.funcID = funcID;
          //this.pageTitle.setBreadcrumbs([]);
          this.layout.showIconBack = true;
          this.pageTitle.setRootNode(this.rootFunction.customName);

          //this.funcID = this.router.snapshot.params['funcID'];
          //this.getReport(funcID);
        }
        else if(event.url.includes(this.rootFunction.funtionID)){

          //this.pageTitle.setTitle(this.rootFunction.customName);
          //this.pageTitle.setSubTitle(this.rootFunction.customName);
          //this.pageTitle.setBreadcrumbs([]);
          //this.setBreadCrumb(this.funcItem,true)
        }
        this.changeDetectorRef.detectChanges();
      }
    })


  }
  viewChanged(e:any){
    this.viewBase.moreFuncs = this.moreFc;
    // if(this.funcID && !this.funcItem){
    //   this.getReport(this.funcID);
    // }
  }
  //get report by ID
  getReport(funcID:string){
    this.api
    .execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetAsync',
      [funcID])
      .subscribe((res: any) => {
      if (res) {
        this.funcItem = res;
        this.reportID = res.reportID;
        this.isRunMode = res.runMode == "1";
        this.getRootFunction(this.funcItem.moduleID, this.funcItem.reportType);
        // this.pageTitle.setSubTitle("");
        if(res.displayMode == "3"){
          this.test(res.recID);
        }
      }
    });
  }
  
  getRootFunction(module:string, type:string){
    this.api
    .execSv("SYS","ERM.Business.SYS","FunctionListBusiness","GetFuncByModuleIDAsync",[module,type])
    .subscribe((res:any)=>{
      if(res){
        this.rootFunction = res;
        this.pageTitle.setRootNode(this.rootFunction.customName);
        let parent: PageLink = {
          title: this.rootFunction.customName,
          path: this.rootFunction.module.toLowerCase()+'/report/' + this.rootFunction.functionID
        }
        this.pageTitle.setParent(parent);
        this.getReportList(this.funcItem.moduleID, this.funcItem.reportType);
      }
    })
  }

  getReportList(moduleID:string,reportType:string){
    this.api
    .execSv("rptrp","Codx.RptBusiness.RP","ReportListBusiness","GetReportsByModuleAsync",[reportType,moduleID])
    .subscribe((res:any)=>{
      this.orgReportList = res;
      let arrChildren : Array<PageLink>=[];
      for(let i=0 ;i< this.orgReportList.length;i++){
        let pageLink: PageLink = {
          title: this.orgReportList[i].customName,
          path:this.rootFunction.module.toLowerCase()+'/report/detail/' + this.orgReportList[i].recID
        };
       arrChildren.push(pageLink);
      }
      this.pageTitle.setChildren(arrChildren);
      this.reportList = this.orgReportList.filter((x:any)=>x.recID != this.funcItem.recID);
      this.setBreadCrumb(this.funcItem);
    })
  }

  setBreadCrumb(func:any,deleteChild:boolean=false){
    if(func){
      !deleteChild && this.pageTitle.setSubTitle(func.customName)
      deleteChild && this.pageTitle.setSubTitle("");
    }
  }

  // get message
  getMessageDefault(){
    this.cache.message("SYS043")
    .subscribe((mssg:any) => {
      if(mssg.defaultName)
        this.mssgSYS043 = mssg.defaultName;
    });
    this.cache.message("SYS044")
    .subscribe((mssg:any) => {
      if(mssg.defaultName)
        this.mssgSYS044 = mssg.defaultName;
    });
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
      " ",
      this.funcID,
      '',
      option
    );
  }
  isRunMode = false;
  filterReportChange(e:any){
    if(this.isRunMode)
      this.isRunMode = false;
    // if(e[0]){
    //   debugger
    //   this.predicate = e[0].predicates;
    //   this.dataValue = e[0].dataValues;
    // }
    if(e == null) return;
    let objParam:any = {};
    let objLabel:any={};
    if(e[1]){
      for(let key in e[1]){
        objParam[key] = e[1][key]
      }

      this._paramString = JSON.stringify(objParam);
    }
    if(e[2]){
      for(let key in e[2]){
        objLabel[key] = e[2][key];
      }
      this._labelString = JSON.stringify(objLabel);
    }
    this.test(this.funcItem.recID);
  }

  
  
  


  
  itemSelect(e:any){
    if(e){
      this.funcItem = e;
      this.codxService.navigate('', e.moduleID.toLowerCase()+'/report/detail/' + e.recID);
      this.reportList = this.orgReportList.filter((x:any)=>x.recID != this.funcItem.recID);
    }
  }
  homeClick(){
    this.codxService.navigate('', this.rootFunction.module.toLowerCase()+'/report/' + this.rootFunction.functionID);
    this.setBreadCrumb(this.funcItem,true);
  }

  clickViewReport(){
    (document.querySelector(".btnApply") as any)?.click();
  }

  url:string = "";
  test(recID:string){
    let sk = "sk=" + btoa(this.authSV.userValue.userID+"|"+this.authSV.userValue.securityKey);
    this.url = `http://localhost:9002/api/reportdowload/GetReportByPDF?reportID=${recID}&parameters=${JSON.stringify(this._paramString)}&${sk}`;
  }
}


