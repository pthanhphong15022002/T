import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, AuthService, CallFuncService, ViewType, DataRequest, RequestOption, UIComponent, DialogModel, AuthStore, CacheService, NotificationsService } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { AppropvalNewsDetailComponent } from './appropval-news-detail/appropval-news-detail.component';
import { PopupAddCommentComponent } from '../popup/popup-add-comment/popup-add-comment.component';

@Component({
  selector: 'wp-appropval-news',
  templateUrl: './appropval-news.component.html',
  styleUrls: ['./appropval-news.component.scss']
})
export class AppropvalNewsComponent extends UIComponent {
  user: any;
  service: string = 'WP';
  assemblyName: string = 'ERM.Business.WP';
  views: Array<ViewModel> = [];
  gridViewSetUp: any = null;
  selectedID: string = '';
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
        this.cache.functionList(param['funcID'])
        .subscribe((func: any) => {
          if (func){
            this.function = func;
            this.loadDataTab();
            this.cache
              .gridViewSetup(func.formName, func.gridViewName)
              .subscribe((grd: any) => {
                  this.gridViewSetUp = grd;
              });
          }
        });
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
    if (this.function){
      this.api.execSv(
        this.service,
        this.assemblyName,
        'NewsBusiness',
        'GetDataTabApproAsync',
        [this.function.functionID])
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
            this.detectorRef.detectChanges();
          }
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
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deletedPost(data);
        break;
      case 'SYS03': //edit
        this.editPost(event,data);
        break;
      case "WPT02121": // duyệt
          this.notifySvr.alertCode("WP004")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(this.function.entityName,data, "5","WP005");
            }
          });
        break;
      case "WPT02122": // làm lại
        this.notifySvr.alertCode("WP008")
        .subscribe((option:any) =>{
          if(option?.event?.status == "Y")
          {
            this.approvalPost(this.function.entityName,data, "2","WP009");
          }
        });
        break;
      case "WPT02123": // từ chối
        this.notifySvr.alertCode("WP006")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(this.function.entityName,data, "2","WP007");
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
    if(this.function.functionID == "WPT0213")
    {
      option.className = "CommentsBusiness";
      option.methodName =  "DeletePostAsync";
    }
    else
    {
      option.className = "NewsBusiness";
      option.methodName =  "DeleteAsync";
    }
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
      this.loadDataTab();
    }
  }

  //change data moreFC
  changeDataMF(evt:any[],item:any){
    evt.map(x => {
      if(x.functionID == "SYS02" || x.functionID == "SYS03")
        x.disabled = false;
      else if(x.functionID == "WPT02131" || x.functionID == "WPT02132" || x.functionID == "WPT02133")
        x.disabled = item.approveControl == "0" || (item.approveControl == "1" && item.approveStatus == "5");
      else
        x.disabled = true;
    });
  }

  //xét duyệt bài viết
  approvalPost(entityName:string,data:any,approvalStatus:string,mssg:string){
    debugger
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "ApprovalPostAsync",
      [entityName,data.recID,approvalStatus]).subscribe((res:any) => {
        if(res)
        {
          data.approveStatus = approvalStatus;
          this.changeApproSatusPost(data);
          if(this.tmpDetail.objectID == data.recID)
          {
            this.tmpDetail.data.approvalStatus = approvalStatus;
            this.tmpDetail.hideMFC = true;
          }
          this.notifySvr.notifyCode(mssg);
        }
        else
          this.notifySvr.notifyCode("SYS019");
    });
  }

  // edit post
  editPost(evt:any,data:any){
    debugger
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.zIndex = 100;
    // WP_News
    if(this.function.entityName !== "WP_AprovalComments")
    {
      option.IsFull = true;
      let obj = {
        action: evt.text,
        isAdd:false,
        data: data
      };
      this.callFuc.openForm(
        PopupAddComponent,
        '',
        0,
        0,
        this.function.functionID,
        obj,
        '',
        option
      ).closed.subscribe((res: any) => {
        if (res?.event)
        {
          this.view.dataService.update(res.event).subscribe();
          this.selectedID = res.event.recID;
          this.detectorRef.detectChanges();
        }
      });
    } 
    // WP_Comments
    else 
    {
      this.api
        .execSv(
          "WP",
          "ERM.Business.WP",
          'CommentsBusiness',
          'GetPostByIDAsync',
          [data.recID])
          .subscribe((res1: any) => {
          if (res1) {
            let obj = {
              data: res1,
              status: 'edit',
              headerText: evt.text,
            };
            this.callfc.openForm(
              PopupAddCommentComponent,
              "",
              700,
              650,
              '',
              obj,
              '',
              option
            ).closed.subscribe((res2:any) => {
              if (res2?.event){
                this.view.dataService.update(res2.event).subscribe();
                this.selectedID = res2.event.recID;
                this.detectorRef.detectChanges();
              }
            });
          }
        });
    }
  }

  // change approval post
  changeApproSatusPost(data:any){
    debugger
    let tabActive = this.tabAsside.find(x => x.active);
    if(tabActive.value == "")
      this.view.dataService.update(data).subscribe();
    else
      this.view.dataService.remove(data).subscribe();
    this.loadDataTab();
  }
}
