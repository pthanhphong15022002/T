import { T, TAB } from '@angular/cdk/keycodes';
import { ThisReceiver } from '@angular/compiler';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@syncfusion/ej2-angular-buttons';
import { DataRequest, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent, CacheService, CallFuncService, SidebarModel, RequestOption, DialogModel, ButtonModel } from 'codx-core';
import { map } from 'rxjs';
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
  predicates = 'ApproveStatus=@0';
  dataValues = '3';
  funcID = "";
  user : any;
  dataDetail:any;
  option = "";
  acceptApprove = "5";
  cancelApprove  = "4";
  remakeApprove = "2";
  views: Array<ViewModel> = [];
  gridViewSetUp: any;
  dataSelected: any;
  itemSelected : any;
  buttonAdd:ButtonModel;
  @ViewChild('itemTemplate') itemTemplate : TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef : TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef : TemplateRef<any>;
  @ViewChild('codxView') codxViews : ViewsComponent;
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
          break;
        case "WPT0212":
         this.predicate = "Approver=@0 && Stop=false";
          break;
        default:
          this.entityName = 'WP_Comments'
          this.predicate = "Approver=@0 && Stop=false"
          break;
      }
      this.getGridViewSetUp().subscribe();
      this.loadTabAsside(this.predicate,this.dataValue,this.entityName);
      this.dt.detectChanges();
    });
  }
  ngAfterViewInit(): void {
    this.buttonAdd = {
      id: 'btnAdd',
    };
    this.views  = [{
      type: ViewType.listdetail,
      active: true,
      sameData: true,
      showButton: true,
      model:{
        template : this.itemTemplate,
        panelLeftRef : this.panelLeftRef,
        panelRightRef : this.panelRightRef
      }
    }];
    this.dt.detectChanges();
  }

  getGridViewSetUp(){
    return this.cache.functionList(this.funcID).pipe(map((func:any) => 
      {
        this.cache.gridViewSetup(func.formName, func.gridViewName).
        subscribe((grd:any) => 
        {
          if(grd){
            this.gridViewSetUp = grd;
            this.dt.detectChanges();
          }  
        });
      }
    ));
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
            else tab.total =  res.filter((x:any) => x == tab.value).length;
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
    this.codxViews.entityName = this.entityName;
    if(predicate && dataValue){
      this.codxViews.dataService.setPredicates([predicate],[dataValue]).subscribe();
    }
    else
    {
      this.codxViews.dataService.setPredicates([],[]).subscribe();
    }
  }
  selectedID:string = "";
  clickViewDetail(postID:string){
    this.selectedID = postID;
    this.dt.detectChanges();
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
          this.codxViews.dataService.remove(data).subscribe();
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
            this.codxViews.dataService.remove(data).subscribe();
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

  clickMF(event:any,data:any){
    switch(event.functionID){
      case 'SYS02':
        this.deletedPost(data);
        break;
      case 'SYS03':
        let option = new DialogModel();
        option.DataService = this.codxViews.dataService;
        option.FormModel = this.codxViews.formModel;
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
              option.DataService = this.codxViews.dataService;
              option.FormModel = this.codxViews.formModel;
              this.callfc.openForm(AddPostComponent,'',700,550,'',obj,'',option).closed.subscribe((data:any) => {
                if(data.result){
                  console.log(data);
                }
              })
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
    this.codxViews.dataService.delete(
      [data],
      true,
      (opt:any)=>this.beforDeletedPost(opt,data)).subscribe();
  }

  clickBtnAdd() {
    
  }
}
