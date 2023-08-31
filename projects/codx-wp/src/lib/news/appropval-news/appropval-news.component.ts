import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, AuthService, CallFuncService, ViewType, DataRequest, RequestOption, UIComponent, DialogModel, AuthStore, CacheService } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { AppropvalNewsDetailComponent } from './appropval-news-detail/appropval-news-detail.component';

@Component({
  selector: 'wp-appropval-news',
  templateUrl: './appropval-news.component.html',
  styleUrls: ['./appropval-news.component.scss']
})
export class AppropvalNewsComponent extends UIComponent {

  service: string = 'WP';
  assemblyName: string = 'ERM.Business.WP';
  funcID: string = '';
  functionName: string = '';
  user: any;
  acceptApprove: string = '5';
  cancelApprove: string = '4';
  remakeApprove: string = '2';
  views: Array<ViewModel> = [];
  gridViewSetUp: any = null;
  dataSelected: any = null;
  itemSelected: any = null;
  selectedID: string = '';
  vllWP004:any[] = [];
  hideMF:boolean = false;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('tmpDetail') tmpDetail: AppropvalNewsDetailComponent;
  tabAsside = [
    {
      name: 'await',
      text: 'Chờ duyệt',
      value: '3',
      total: 0,
      active: false,
    },
    {
      name: 'approve',
      text: 'Đã duyệt',
      value: '5',
      total: 0,
      active: false,
    },
    {
      name: 'cancel',
      text: 'Từ chối',
      value: '4',
      total: 0,
      active: false,
    },
    {
      name: 'all',
      text: 'Tất cả',
      value: '',
      total: 0,
      active: true,
    },
  ];
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private callFuc: CallFuncService
  ) 
  {
    super(injector);
    this.user = this.auth.get();

  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param['funcID']) {
        this.funcID = param['funcID'];
        this.hideMF = this.funcID !== "WPT0211";
        this.cache.functionList(this.funcID)
        .subscribe((func: any) => {
          if (func) {
            this.functionName = func.customName;
            this.cache
              .gridViewSetup(func.formName, func.gridViewName)
              .subscribe((grd: any) => {
                  this.gridViewSetUp = grd;
              });
          }
        });
        this.loadDataTab(this.funcID);
      }
    });
    this.cache.valueList("WP004")
    .subscribe((vll:any)=> {
      if(Array.isArray(vll?.datas))
        vll.datas.forEach(e => this.vllWP004[e.value] = e);
    })
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
          panelRightRef: this.panelRightRef,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }
  // get data tab list
  loadDataTab(funcID: string) {
    if (funcID){
      this.api
        .execSv(
          this.service,
          this.assemblyName,
          'NewsBusiness',
          'GetDataTabApproAsync',
          [funcID])
        .subscribe((res: any[]) => {
          if(res) 
          {
            this.tabAsside.map((tab: any) => {
              tab.total = 0;
              if(tab.value == "")
                res.forEach(x => tab.total += x.Count);
              else 
              {
                let ele = res.find(x => x.Status == tab.value);
                tab.total = ele ? ele.Count : 0;
              }
            });
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  //selected change
  selectedChange(event: any) {
    if (event?.data?.recID) 
    {
      this.selectedID = event.data.recID;
      this.detectorRef.detectChanges();
    }
  }
  
  realoadData(event: any) {
    this.loadDataTab(this.view.funcID);
  }
  // click tab approval
  clickTabApprove(item) {
    let predicates = [item.value ? "ApproveStatus = @0" : ""];
    let dataValues = [item.value];
    this.view.dataService.page = 0;
    this.view.dataService.setPredicates(predicates, dataValues);
    this.tabAsside.forEach((e) => {
        e.active = e.value === item.value ;
    });
  }
  // click moreFunc
  clickMF(event: any, data: any) {
    this.itemSelected = data;
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deletedPost(data);
        break;
      case 'SYS03': //edit
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        // WP_News
        if(this.view.funcID !== 'WPT0213') 
        {
          option.IsFull = true;
          option.zIndex = 100;
          let obj = {
            action: event.text,
            isAdd:false,
            data: data
          };
          let popup = this.callFuc.openForm(
            PopupAddComponent,
            '',
            0,
            0,
            this.view.funcID,
            obj,
            '',
            option
          );
          popup.closed.subscribe((res: any) => {
            if (res?.event) {
              this.view.dataService.update(res.event).subscribe();
            }
          });
        } 
        // MXH
        else 
        {
          this.api
            .execSv(
              this.service,
              this.assemblyName,
              'CommentsBusiness',
              'GetPostByIDAsync',
              [data.recID])
              .subscribe((res: any) => {
              if (res) {
                let obj = {
                  data: res,
                  status: 'edit',
                  headerText: event.text,
                };
                let option = new DialogModel();
                option.DataService = this.view.dataService;
                option.FormModel = this.view.formModel;
                let popup = this.callfc.openForm(
                  PopupAddPostComponent,
                  event.text,
                  700,
                  550,
                  '',
                  obj,
                  '',
                  option
                );
                popup.closed.subscribe((res: any) => {
                  if (res?.event) {
                    this.view.dataService.update(res.event).subscribe();
                    debugger;
                  }
                });
              }
            });
        }
        break;
      default:
        break;
    }
  }

  beforDeletedPost(option: RequestOption, recID: string) {
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    option.className = this.funcID == "WPT0213" ? "CommentsBusiness" : "NewsBusiness";
    option.methodName =  this.funcID == "WPT0213" ? "DeletePostAsync" : "DeleteAsync";
    option.data = recID;
    return true;
  }

  deletedPost(data: any) {
    if (data?.recID)
    {
      this.view.dataService
      .delete([data], true, (opt: any) => this.beforDeletedPost(opt, data.recID))
      .subscribe();
    }
  }

  // set style icon
  setStyles(value: string) {
    let styles = {
      backgroundColor: this.vllWP004[value].color,
      color: this.vllWP004[value].textcolor,
    };
    return styles;
  }
  //set des
  setDescription(data:any):string
  {
    if(data.category == "1" || data.category == "3" || data.category == "4")
      return data.content;
    else if(data.category == "companyinfo")
      return data.contents.replace(/<[^>]*>/g, "");
    else
      return data.subject;
  }

  //
  hideMFc(moreFC:any,data:any){
    Array.from(moreFC).map((x:any) => {
        x.disabled = true;
    });
  }
}
