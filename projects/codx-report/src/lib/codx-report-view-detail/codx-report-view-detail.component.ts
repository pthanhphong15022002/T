
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore, DialogModel, LayoutService, PageLink, PageTitleService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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
      // {
      //   type: ViewType.list,
      //   sameData: true,
      //   active: false,

      //   // model: {
      //   //   template: ,
      //   // },
      // },
    ];

    // this.routerNg.events.subscribe((event: any)=>{
    //   if(event instanceof NavigationEnd){
    //     if(event.url.includes('detail')){
    //       debugger
    //       let funcID = event.url.split('/').pop();
    //       this.funcID = funcID;
    //       //this.pageTitle.setBreadcrumbs([]);
    //       this.layout.showIconBack = true;
    //       this.pageTitle.setRootNode(this.rootFunction.customName);

    //       //this.funcID = this.router.snapshot.params['funcID'];
    //       this.getReport(funcID);
    //     }
    //     else if(event.url.includes(this.rootFunction.funtionID)){

    //       //this.pageTitle.setTitle(this.rootFunction.customName);
    //       //this.pageTitle.setSubTitle(this.rootFunction.customName);
    //       //this.pageTitle.setBreadcrumbs([]);
    //       this.setBreadCrumb(this.funcItem,true)
    //     }
    //     this.changeDetectorRef.detectChanges();
    //   }
    // })


  }
  viewChanged(e:any){
    this.funcID = this.router.snapshot.params['funcID'];
    this.viewBase.moreFuncs = this.moreFc;
    //this.pageTitle.setBreadcrumbs([]);

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
  }

  getRootFunction(module:string, type:string){
    this.api.execSv("SYS","ERM.Business.SYS","FunctionListBusiness","GetFuncByModuleIDAsync",[module,type]).subscribe((res:any)=>{
      if(res){
        this.rootFunction = res;
        this.pageTitle.setRootNode(this.rootFunction.customName)
        let parent: PageLink = {
          title: this.rootFunction.customName,
          path: this.rootFunction.module.toLowerCase()+'/report/' + this.rootFunction.functionID
        }
        this.pageTitle.setParent(parent)
        this.getReportList(this.funcItem.moduleID, this.funcItem.reportType);
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

        this.getRootFunction(this.funcItem.moduleID, this.funcItem.reportType);
        this.pageTitle.setSubTitle("")

      }
    });
  }
  setBreadCrumb(func:any,deleteChild:boolean=false){
    if(func){
      !deleteChild && this.pageTitle.setSubTitle(func.customName)
      //deleteChild && this.pageTitle.setSubTitle("");
      // let eleHeader = document.querySelector('codx-header');
      // if(eleHeader){
      //   let titleEle = eleHeader.querySelector('codx-page-title');
      //     if(titleEle){
      //       (titleEle as HTMLElement).innerHTML='';

      //       if(!titleEle.querySelector('#clonedBreadCrumb') && !deleteChild){
      //         let clone = this.breadCrumb.nativeElement
      //         clone.id = 'clonedBreadCrumb';
      //         if(clone.classList.contains('invisible')) clone.classList.remove('invisible')
      //         titleEle.appendChild(clone);
      //       }
      //       if(deleteChild){
      //         titleEle.querySelector('#clonedBreadCrumb')?.remove();
      //       }
      //     }
      // }
    }
  }
  getReportList(moduleID:string,reportType:string){
    this.api.execSv("rptsys",'Codx.RptBusiniess.SYS',"ReportListBusiness","GetReportsByModuleAsync",[reportType,moduleID]).subscribe((res:any)=>{
      this.orgReportList = res;
      let arrChildren : Array<PageLink>=[];
      for(let i=0 ;i< this.orgReportList.length;i++){
        let pageLink: PageLink = {
          title: this.orgReportList[i].customName,
          path:this.rootFunction.module.toLowerCase()+'/report/detail/' + this.orgReportList[i].reportID
        };
       arrChildren.push(pageLink);
      }
      this.pageTitle.setChildren(arrChildren);
      this.reportList = this.orgReportList.filter((x:any)=>x.reportID != this.funcItem.reportID);
      this.setBreadCrumb(this.funcItem);
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
    this.setBreadCrumb(this.funcItem,true);
  }

}
