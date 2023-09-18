import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, AuthService, CallFuncService, ViewType, DataRequest, RequestOption, UIComponent, DialogModel, AuthStore, CacheService, NotificationsService } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { AppropvalNewsDetailComponent } from './appropval-news-detail/appropval-news-detail.component';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'wp-appropval-news',
  templateUrl: './appropval-news.component.html',
  styleUrls: ['./appropval-news.component.scss']
})
export class AppropvalNewsComponent extends UIComponent {

  service: string = 'WP';
  assemblyName: string = 'ERM.Business.WP';
  user: any;
  acceptApprove: string = '5';
  cancelApprove: string = '4';
  remakeApprove: string = '2';
  views: Array<ViewModel> = [];
  gridViewSetUp: any = null;
  dataSelected: any = null;
  itemSelected: any = null;
  selectedID: string = '';
  hideMF:boolean = false;
  function:any = null;
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
    private callFuc: CallFuncService,
    private notifySvr:NotificationsService
  ) 
  {
    super(injector);
    this.user = this.auth.get();

  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param['funcID']) {
        this.funcID = param['funcID'];
        this.hideMF = this.funcID === "WPT0211";
        this.cache.functionList(this.funcID)
        .subscribe((func: any) => {
          if (func) {
            this.function = func;
            this.cache
              .gridViewSetup(func.formName, func.gridViewName)
              .subscribe((grd: any) => {
                  this.gridViewSetUp = grd;
              });
          }
        });
        this.loadDataTab();
      }
      this.detectorRef.detectChanges();
    });
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
  loadDataTab() {
    if (this.funcID){
      this.api.execSv(
        this.service,
        this.assemblyName,
        'NewsBusiness',
        'GetDataTabApproAsync',
        [this.funcID])
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
    debugger
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deletedPost(data);
        break;
      case 'SYS03': //edit
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        // WP_News
        if(this.function.entityName !== "WP_AprovalComments"){
          option.IsFull = true;
          option.zIndex = 100;
          let obj = {
            action: event.text,
            isAdd:false,
            data: data
          };
          this.callFuc.openForm(
            PopupAddComponent,
            '',
            0,
            0,
            this.view.funcID,
            obj,
            '',
            option
          ).closed.subscribe((res: any) => {
            if (res?.event)
            {
              this.view.dataService.update(res.event).subscribe();
              this.selectedID = event.data.recID;
              this.itemSelected = data;
              this.detectorRef.detectChanges();
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
              .subscribe((res1: any) => {
              if (res1) {
                let obj = {
                  data: res1,
                  status: 'edit',
                  headerText: event.text,
                };
                this.callfc.openForm(
                  PopupAddPostComponent,
                  event.text,
                  700,
                  550,
                  '',
                  obj,
                  '',
                  option
                ).closed.subscribe((res2:any) => {
                  if (res2?.event) {
                    this.view.dataService.update(res2.event).subscribe();
                    this.selectedID = event.data.recID;
                    this.itemSelected = data;
                    this.detectorRef.detectChanges();
                  }
                });
              }
            });
        }
        break;
      case "WPT02131": // duyệt
          this.notifySvr.alertCode("WP004")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(data.recID, "5")
              .subscribe((res:any) => {
                if(res)
                {
                  data.approveStatus = "5";
                  this.view.dataService.update(data).subscribe();
                  this.loadDataTab();
                  this.notifySvr.notifyCode("WP005");
                }
              });
            }
          });
        break;
      case "WPT02122": // làm lại
        this.notifySvr.alertCode("WP008")
        .subscribe((option:any) =>{
          if(option?.event?.status == "Y")
          {
            this.approvalPost(data.recID, "2")
            .subscribe((res:any) => {
                if(res)
                {
                  data.approveStatus = "2";
                  this.view.dataService.update(data).subscribe();
                  this.loadDataTab();
                  this.notifySvr.notifyCode("WP009");
                }
              });
          }
        });
        break;
      case "WPT02123": // từ chối
        this.notifySvr.alertCode("WP006")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(data.recID, "2")
              .subscribe((res:any) => {
                  if(res)
                  {
                    data.approveStatus = "2";
                    this.view.dataService.update(data).subscribe();
                    this.loadDataTab();
                    this.notifySvr.notifyCode("WP007");
                  }
                });
            }
        });
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

  // delete Post
  deletedPost(data: any) {
    if (data?.recID)
    {
      this.view.dataService
      .delete([data], true, (opt: any) => this.beforDeletedPost(opt, data.recID))
      .subscribe();
    }
  }

  //change data moreFC
  changeDataMF(evt:any[],item:any){
    if(item.approveControl == "0" || (item.approveControl == "1" && item.approveStatus == "5"))
    {
      evt.map(x => {
        if(x.functionID == "WPT02131" || x.functionID == "WPT02132" || x.functionID == "WPT02133")
        {
          x.disabled = true;
        }
      });
    }
    
  }

  //xét duyệt bài viết
  approvalPost(recID:string,approvalStatus)
  {
    return this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "ApprovalPostAsync",
      [this.function.entityName,recID,approvalStatus]);
  }
}
