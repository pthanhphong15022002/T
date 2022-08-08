import { T, TAB } from '@angular/cdk/keycodes';
import { ThisReceiver } from '@angular/compiler';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataRequest, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent, CacheService, CallFuncService, SidebarModel, RequestOption, DialogModel } from 'codx-core';
import { AddPostComponent } from '../dashboard/home/list-post/popup-add/addpost/addpost.component';
import { PopupEditComponent } from '../news/popup/popup-edit/popup-edit.component';
import { ApproveDetailComponent } from './approve-detail/approve-detail.component';

@Component({
  selector: 'lib-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss']
})
export class ApproveComponent extends UIComponent {

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
  @ViewChild('view') codxViews : ViewsComponent;
  @ViewChild('viewdetail') viewdetail : ApproveDetailComponent;


  tabAsside = [
    {
      name:"await",
      text:"Chờ duyệt",
      value: "3",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"3",
      active:true
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
    private callFuc: CallFuncService,
    private route: ActivatedRoute,
private injector:Injector
  ) 
  {
    super(injector);
  }
  onInit(): void {
    this.user = this.auth.userValue;
    this.route.params.subscribe((param) =>{
      this.funcID = param["funcID"];
      this.dataSelected = null;
      this.entityName = "WP_News";
      this.dataValue = this.user.userID;     
      switch (this.funcID){
        case "WPT0211":
          this.predicate = "CreatedBy=@0 && Stop=false";
          this.option = "mypost";
          break;
        case "WPT0212":
         this.predicate = "Approver=@0 && Stop=false";
          this.option = "webpost";
          break;
        default:
          this.entityName = 'WP_Comments'
          this.predicate = "Approver=@0 && Stop=false"
          this.option = "post";
          break;
          
      }
      this.getGridViewSetUp();
      this.loadTabAsside(this.predicate,this.dataValue,this.entityName);
      if(this.view){
        this.view.dataService.request.entityName = this.entityName;
        this.view.dataService.setPredicates([this.tabAsside[0].predicate],[this.tabAsside[0].value]).subscribe();
      } 
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
        else
        {
          this.tabAsside.map((tab:any) => tab.total = 0);
          this.dt.detectChanges();
        }
      }
    );
  }
  loadData(predicate:string,dataValue:string){
    this.view.dataService.request.entityName = this.entityName;
    if(predicate && dataValue){
      this.view.dataService.setPredicates([predicate],[dataValue]).subscribe();
    }
    else
    {
      this.view.dataService.setPredicates([],[]).subscribe();
    }
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
  clickApprovePost(event:any){
    let approveStatus = event.approveStatus;
    let data = event.data;
    switch(approveStatus)
    {
      case this.acceptApprove:
        this.notifySvr.alertCode("WP004").subscribe((evt:any) => {
          if(evt.event.status == 'Y'){
            this.approvePost(data,approveStatus);
          }
        });
        break;
      case this.cancelApprove:
        this.notifySvr.alertCode("WP006").subscribe((evt:any) => {
          if(evt.event.status == 'Y')
            this.cancelPost(data,approveStatus);
        });
        break;
      default:
        this.notifySvr.alertCode("WP008").subscribe((evt:any) => {
          if(evt.event.status == 'Y')
          {
              this.remakePost(data,approveStatus);
          }
          });
        break;
    }
  }

  approvePost(data:any,approveStatus:any){
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",
    [data.entityName,data.recID,approveStatus])
    .subscribe((res) => 
      {
        if(res)
        {
          this.dataDetail = null;
          this.tabAsside.forEach((t:any) => {
            if(t.value == data.approveStatus) {
              t.total--;
              return;
            }
          });
          this.tabAsside[1].total++;
          this.view.dataService.remove(data).subscribe();
          this.notifySvr.notifyCode("WP005");
          this.dt.detectChanges();
        }
      });
  }


  cancelPost(data:any,approveStatus:any){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",
      [data.entityName,data.recID,approveStatus])
      .subscribe((res) => 
        {
          if(res)
          {
            this.dataDetail = null;
            this.tabAsside.map((t:any) => {
              if(t.value == data.approveStatus) t.total--;
            })
            this.tabAsside[2].total++;
            this.view.dataService.remove(data).subscribe();
            this.notifySvr.notifyCode("WP007");
            this.dt.detectChanges();
          }
        }
      );
  }

  remakePost(data:any,approveStatus:any){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",
      [data.entityName,data.recID,approveStatus])
      .subscribe((res) => 
        {
          if(res)
          {
            this.dataDetail = null;
            this.notifySvr.notifyCode("WP009");
            this.dt.detectChanges();
          }
        }
      );
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
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        if(this.entityName == "WP_News"){
          option.IsFull = true;
          this.callFuc.openForm(PopupEditComponent,'Cập nhật bài viết',0,0,this.funcID,data,'',option);
        }
        else 
        {
          this.api.execSv(this.service,this.assemblyName,"CommentsBusiness","GetPostByIDAsync", data.recID)
          .subscribe((res:any) => {
            if(res) {
              let obj = {
                post: res,
                status: 'edit',
                headerText: 'Chỉnh sửa bài viết',
              };
              let option = new DialogModel();
              option.DataService = this.view.dataService;
              option.FormModel = this.view.formModel;
              this.callfc.openForm(AddPostComponent,'',700,550,'',obj,'',option);
            }});
        }
        break;
      default:
        break;
    }
  }

  beforDeletedPost(option:RequestOption,data:any){
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "NewsBusiness";
    if(this.entityName == "WP_News"){
      option.methodName = "DeleteNewsAsync";
    }
    else 
    {
      option.methodName = "DeletePostAsync";
    }
    option.data = data;
    return true;
  }

  deletedPost(data:any){
    if(!data)return;
    this.view.dataService.delete(
      [data],
      true,
      (opt:any)=>this.beforDeletedPost(opt,data)).subscribe();
  }
}
