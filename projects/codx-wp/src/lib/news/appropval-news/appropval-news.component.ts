import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, AuthService, CallFuncService, ViewType, DataRequest, RequestOption, UIComponent, DialogModel, AuthStore, CacheService, NotificationsService } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { AppropvalNewsDetailComponent } from './appropval-news-detail/appropval-news-detail.component';
import { PopupAddCommentComponent } from '../popup/popup-add-comment/popup-add-comment.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

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
  vllWP004:any[] = [];
  loadedDetail=true;

  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('tmpDetail') tmpDetail: AppropvalNewsDetailComponent;
  approvers: any;
  approvePre='';
  approveDv: any='';
  tabAsside = [];
  predicates:string;
  datavalues:string;
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private callFuc: CallFuncService,
    private codxShareService: CodxShareService,
    private notifySvr:NotificationsService
  ) 
  {
    super(injector);
    this.user = this.auth.get();
  }
  onInit(): void {    
    let funcID = this.router.snapshot.params["funcID"];
    this.predicates = this.router.snapshot.queryParams["predicate"];
    this.datavalues = this.router.snapshot.queryParams["dataValue"];
    this.cache.functionList(funcID)
    .subscribe((func: any) => {
      if (func)
      {
        this.function = func;
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            this.gridViewSetUp = grd;
        });
      }
    });
    this.loadDataTab(funcID,this.predicates,this.datavalues);
    this.cache.valueList("WP004")
    .subscribe((vll:any) => {
      if(vll)
      {
        this.vllWP004 = vll.datas;
        this.detectorRef.detectChanges();
      }
    });
    this.tabAsside = [
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
      }
    ];
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


  loadDataTab(funcID:string,predicates:string = "",dataValues:string = "") {
    this.api.execSv(
    "WP",
    "WP",
    'NewsBusiness',
    'GetDataTabApproAsync',
    [funcID,predicates,dataValues])
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
      else
      {
        this.tabAsside.map((tab: any) => {
          tab.total = 0;
        });
      }
      this.detectorRef.detectChanges();
    });
  }

  selectedChange(event: any) {
    if (event?.data?.recID) 
    {
      this.selectedID = event.data.recID;
      this.detectorRef.detectChanges();
    }
  }
  
  clickTabApprove(item) {
    if(item)
    {
      this.tabAsside.forEach((e) => {
        e.active = e.value === item.value ;
      });
      if(item.value)
      {
        this.detectorRef.detectChanges();
        this.view.dataService.setPredicates(["ApproveStatus = @0"], [item.value]);
      }
      else 
      {
        this.detectorRef.detectChanges();
        this.view.dataService.setPredicates([], []);
      }
    }
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
      case "WPT02121":
      case "WPT02131": // duyệt
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
      case "WPT02123": 
      case "WPT02133": // từ chối
        this.notifySvr.alertCode("WP006")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(this.function.entityName,data, "4","WP007");
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
      .subscribe((res) => {
        let arrData = this.view.dataService.data;
        arrData.map(x => {

        })
      });
    }
  }

  //change data moreFC
  changeDataMF(evt:any[],item:any){
    evt.map(x => {
      if((x.functionID == "SYS02" || x.functionID == "SYS03") && this.function.functionID =='WPT0211')
      {
        x.disabled = true;
        //Ko duyệt
        if(item.approveControl == "0"){
          if(item?.status =="1" ){
            x.disabled = false;
          }
          else if(item?.status =="2" ){
            if(this.user.administrator && x.functionID == "SYS02"){
              x.disabled = false;
            }
          }
        }        
        //Có duyệt
        else if(item.approveControl == "1"){
          if(item?.approveStatus =="1" ){
            x.disabled = false;
          }
          else if(this.user.administrator && x.functionID == "SYS02")
          {
            x.disabled = false;    
          }
        }
      }
      else if(x.functionID == "WPT02131" || x.functionID == "WPT02132" || x.functionID == "WPT02133")
        x.disabled = item.approveControl == "0" || (item.approveControl == "1" && item.approveStatus == "5");
      else if (
        x.functionID == 'WPT02131' ||
        x.functionID == 'WPT02133' ||
        x.functionID == 'WPT02121' ||
        x.functionID == 'WPT02123'
      )
        x.disabled =
          item.approveControl == '0' ||
          (item.approveControl == '1' && item.approveStatus != '3');
      else x.disabled = true;
    });
  }

  //xét duyệt bài viết
  approvalPost(entityName:string,data:any,approvalStatus:string,mssg:string){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "ApprovalPostAsync",
      [entityName,data.recID,approvalStatus]).subscribe((res:any) => {
        if(res)
        {
          data.approveStatus = approvalStatus;
          data.status = approvalStatus =='5' ? '2' : data.status;
          this.changeApproSatusPost(data);
          if(this.tmpDetail.objectID == data.recID)
          {
            this.tmpDetail.data.approvalStatus = approvalStatus;
            this.tmpDetail.hideMFC = true;
            this.detectorRef.detectChanges();
          }
          
          if(data.recID == this.selectedID){
            this.loadedDetail = false;
            this.detectorRef.detectChanges();
            this.loadedDetail = true;            
          }
          this.detectorRef.detectChanges();
          this.notifySvr.notifyCode(mssg);
        }
        else
          this.notifySvr.notifyCode("SYS019");
        console.clear();
    });
  }

  // edit post
  editPost(evt:any,data:any){
    if(evt && data)
    var option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.zIndex = 100;
    // WP_News
    if(this.function.entityName !== "WP_AprovalComments"){
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
          let obj = {
            recID:res.event.recID,
            title: "",
            descriptions: res.event.subject,
            category:res.event.category,
            approveControl:res.event.approveControl,
            approveStatus:res.event.approveStatus,
            status:res.event.status,
            createdBy:res.event.createdBy,
            createdOn:res.event.createdOn,
            modifiedBy:res.event.modifiedBy,
            modifiedOn:res.event.modifiedOn,
            delete:res.event.delete,
            write:res.event.write,
            share:res.event.share
          };
          if(this.vllWP004?.length > 0)
            obj.title = this.vllWP004.find(x => x.value = obj.category)?.text;
          this.selectedID = obj.recID;
          this.view.dataService.update(obj).subscribe();
          this.detectorRef.detectChanges();
        }
        console.clear();
      });
    } 
    // WP_Comments
    else {
      this.api
        .execSv(
          "WP",
          "ERM.Business.WP",
          'CommentsBusiness',
          'GetPostByIDAsync',
          [data.recID])
          .subscribe((res: any) => {
          if (res) 
          {
            let obj = {
              data: res,
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
            ).closed.subscribe((res:any) => {
              if (res?.event)
              {
                let obj = {
                  recID:res.event.recID,
                  title: "",
                  descriptions: res.event.content,
                  category:res.event.category,
                  approveControl:res.event.approveControl,
                  approveStatus:res.event.approvalStatus,
                  modifiedBy:res.event.modifiedBy,
                  modifiedOn:res.event.modifiedOn,
                  delete: res.event.delete,
                  write:res.event.write,
                  share:res.event.share
                };
                if(this.vllWP004?.length > 0)
                  obj.title = this.vllWP004.find(x => x.value = obj.category)?.text;
                this.selectedID = obj.recID;
                this.view.dataService.update(obj).subscribe();
                this.detectorRef.detectChanges();
              }
            });
          }
        });
    }
  }

  changeApproSatusPost(data:any){
    let idx = this.view.dataService.data.findIndex(x => x.recID == data.recID);
    let tabActive = this.tabAsside.find(x => x.active);
    let tmp = this.view.dataService.data[idx];
    if(tabActive.value == "")
    {
      tmp.approveStatus = data.approveStatus;
      tmp.modifiedOn = new Date();
      this.view.dataService.update(tmp).subscribe();

    }
    else
      this.view.dataService.remove(tmp).subscribe();
    this.loadDataTab(this.view.funcID,this.predicates,this.datavalues);
    this.detectorRef.detectChanges();
  }
}
