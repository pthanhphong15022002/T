import { E, P } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DataRequest, CodxListviewComponent, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent, CacheService, CallFuncService, SidebarModel, RequestOption, DialogModel } from 'codx-core';
import { extractContent } from '../function/default.function';
import { PopupAddComponent } from '../news/popup/popup-add/popup-add.component';
import { PopupEditComponent } from '../news/popup/popup-edit/popup-edit.component';
import { ApproveDetailComponent } from './approve-detail/approve-detail.component';

@Component({
  selector: 'lib-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss']
})
export class ApproveComponent implements OnInit {
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness";
  method = "GetDataApprovalAsync";
  entityName = "";
  predicate = "";
  dataValue = "";
  funcID = "";
  user : any;
  dataDetail:any;
  option = "";
  acceptApprove = "5";
  cancelApprove  = "4";
  remakeApprove = "2";
  views: Array<ViewModel> = [];
  gridViewSetUp: any;
  formModel: any;
  dataSelected: any;
  itemSelected : any;
  @ViewChild('itemTemplate') itemTemplate : TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef : TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef : TemplateRef<any>;
  @ViewChild('codxViews') codxViews : ViewsComponent;
  @ViewChild('viewdetail') viewdetail : ApproveDetailComponent;


  tabAsside = [
    {
      name:"await",
      text:"Chờ duyệt",
      value: "3",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"3",
      active:false
    },
    {
      name:"approve",
      text:"Đã duyệt",
      value: "5",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"5",
      active:false
    },
    {
      name:"cancel",
      text:"Từ chối",
      value: "4",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"4",
      active:false
    },
    {
      name:"all",
      text:"Tất cả",
      value: "0",
      total:0,
      predicate:"",
      datavalue:"",
      active:false
    },
  ]
  constructor
  (
    private dt:ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private auth:AuthService,
    private cache: CacheService,
    private api : ApiHttpService,
    private callFuc: CallFuncService,
    private route: ActivatedRoute
  ) 
  {

  }
  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.route.params.subscribe((param) =>{
      this.funcID = param["funcID"];
      this.dataSelected = null;
      this.entityName = "WP_News";
      this.dataValue = this.user.userID;     
      switch (this.funcID){
        case "WPT0211":
          this.predicate = "CreatedBy=@0 ";
          this.option = "mypost";
          break;
        case "WPT0212":
          this.predicate = "Approver=@0";
          this.option = "webpost";
          break;
        default:
          this.entityName = 'WP_Comments'
          this.predicate = "Approver=@0"
          this.option = "post";
          break;
          
      }
      this.getGridViewSetUp();
      this.loadTabAsside(this.predicate,this.dataValue,this.entityName);
      this.dt.detectChanges();
    });
    

  }
  ngAfterViewInit(): void {
    this.views  = [{
      type: ViewType.listdetail,
      active: true,
      sameData: true,
      model:{
        template : this.itemTemplate,
        panelLeftRef : this.panelLeftRef,
        panelRightRef : this.panelRightRef
      }
    }];
    this.clickTabApprove(null,this.tabAsside[0].predicate,this.tabAsside[0].datavalue)
    this.dt.detectChanges();
  }

  getGridViewSetUp(){
    this.cache.functionList(this.funcID).subscribe((func) => {
      this.cache.gridViewSetup(func?.formName, func?.gridViewName).subscribe((grd) => {
        this.gridViewSetUp = grd;
        this.dt.detectChanges();
      });
      this.cache.moreFunction(func?.formName, func?.gridViewName).subscribe((mfunc) => {
        console.log('moreFunction',mfunc);
      })
    })
  }
  loadTabAsside(predicate:string, dataValue:string,entityName:string){
    let model = new DataRequest();
    model.predicate = predicate;
    model.dataValue = dataValue;
    model.entityName = entityName;
    model.srtColumns = 'CreatedOn';
    model.srtDirections = 'desc';
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetApprovalPostAsync",model).subscribe(
      (res:any[]) => {
        if(res.length > 0){
          this.tabAsside.map((tab:any) => {
            if(tab.value == "0"){
              tab.total = res.length;
            }
            else{
            tab.total =  res.filter((x:any) => x == tab.value).length;
            }
          })
          this.tabAsside[0].active = true;
          this.dt.detectChanges();
        }
      }
    )
  }
  loadData(predicate:string,dataValue:string){
    this.codxViews.entityName = this.entityName;
    this.codxViews.dataService.setPredicates([predicate],[dataValue]).subscribe();
  }
  clickViewDetail(data:any,entityName:string){
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetPostInfoAsync",[data.recID,entityName])
    .subscribe((res) => {
      if(res){
        this.dataSelected = res;
        this.dataDetail = res;
        console.log(res);
        this.dt.detectChanges();
      }
    })
  }

  clickApprovePost(data:any,approveStatus:any){
    switch(approveStatus)
    {
      case this.acceptApprove:
        this.notifySvr.alertCode("WP004").subscribe((dt:Dialog) => {
          var t = this;
          dt.close = function(e){
            return t.approvePost(e,data,approveStatus,t);
          }
        });
        break;
      case this.cancelApprove:
        this.notifySvr.alertCode("WP006").subscribe((dt:Dialog) => {
          var t = this;
          dt.close = function(e){
            return t.cancelPost(e,data,approveStatus,t);
          }
        });
        break;
      default:
        this.notifySvr.alertCode("WP008").subscribe((dt:Dialog) => {
          var t = this;
          dt.close = function(e){
            return t.remakePost(e,data,approveStatus,t);
          }
        });
        break;
    }
  }

  approvePost(e:any,data:any,approveStatus:any,t:ApproveComponent){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            // this.listView.removeHandler(data, 'recID');
            this.dataDetail = null;
            this.tabAsside[0].total--;
            this.tabAsside[1].total++;
            t.notifySvr.notifyCode("WP005");
            this.dt.detectChanges();
          }
        }
      );
    }
  }


  cancelPost(e:any,data:any,approveStatus:any,t:ApproveComponent){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            // this.listView.removeHandler(data, 'recID');
            this.dataDetail = null;
            this.tabAsside[0].total--;
            this.tabAsside[2].total++;
            t.notifySvr.notifyCode("WP007");
            this.dt.detectChanges();
          }
        }
      );
    }
  }

  remakePost(e:any,data:any,approveStatus:any,t:ApproveComponent){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            this.dataDetail = null;
            this.tabAsside[0].total--;
            t.notifySvr.notifyCode("WP009");
            this.dt.detectChanges();
          }
        }
      );
    } 
  }

  clickTabApprove(item = null ,predicate:string,dataValue:string){
    if(!item){
      this.tabAsside[0].active = true;
    }
    else{
      this.tabAsside.map(x => {if(x.name != item.name) x.active = false;})
      item.active = true;
    }
    this.loadData(predicate,dataValue);
  }


  selectedChange(data: any) {
    this.itemSelected = data;
    this.dt.detectChanges();
  }

  clickMF(event:any,data:any){
    switch(event.functionID){
      case 'SYS02':
        this.deletedPost(data);
        break;
      case 'SYS03':
        let option = new DialogModel();
        option.DataService = this.codxViews.dataService;
        option.FormModel = this.codxViews.formModel;
        option.IsFull = true;
        this.callFuc.openForm(PopupEditComponent,'Cập nhật bài viết',0,0,this.funcID,{dataEdit:data, type : data.newsType},'',option);
        break;
      default:
        break;
    }
  }

  beforDeletedPost(option:RequestOption,data:any){
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    if(this.entityName == "WP_News"){
      option.className = "NewsBusiness";
      option.methodName = "DeleteNewsAsync";
    }
    else 
    {
      option.className = "CommentsBusiness";
      option.methodName = "DeletePostAsync";
    }
    option.data = data;
    return true;
  }

  deletedPost(data:any){
    if(!data)return;
    this.codxViews.dataService.delete(
      [data],
      true,
      (opt:any)=>this.beforDeletedPost(opt,data)).subscribe();
  }
}
