import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DataRequest, CodxListviewComponent, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent, CacheService, CallFuncService, SidebarModel } from 'codx-core';
import { extractContent } from '../function/default.function';
import { PopupAddComponent } from '../news/popup/popup-add/popup-add.component';
import { ApproveDetailComponent } from './approve-detail/approve-detail.component';

@Component({
  selector: 'lib-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css']
})
export class ApproveComponent implements OnInit {
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness";
  method = "GetListNewByADMinAsync";
  entityName = "";
  predicate = "CreatedBy =@0";
  dataValue = "";
  funcID = "";
  user : any;
  totalAwaitApprove = 0;
  totalApprove = 0;
  totalCancelApprove = 0;
  totalAll = 0;
  dataDetail:any;
  option = "";
  acceptApprove = "5";
  cancelApprove  = "4";
  remakeApprove = "2";
  model = new DataRequest();
  views: Array<ViewModel> = [];
  gridViewSetUp: any;
  formModel: any;
  dataSelected: any;
  extractContent = extractContent;
  @ViewChild('itemTemplate') itemTemplate : TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef : TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef : TemplateRef<any>;
  @ViewChild('codxViews') codxViews : ViewsComponent;
  @ViewChild('viewdetail') viewdetail : ApproveDetailComponent;


  navAsside = [
    {
      name:"await",
      text:"Chờ duyệt",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";3",
      active:false
    },
    {
      name:"approve",
      text:"Đã duyệt",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";5",
      active:false
    },
    {
      name:"cancel",
      text:"Từ chối",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";4",
      active:false
    },
    {
      name:"all",
      text:"Tất cả",
      value: 0,
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
    this.user = this.auth.userValue;
    this.dataValue = this.user.userID;
  }
  ngOnInit(): void {
    this.route.params.subscribe((param) =>{
      this.funcID = param["funcID"];
      this.dataSelected = null;
      this.entityName = "WP_News";     
      this.dataValue =  this.user.userID;
      this.model.dataValue = this.dataValue;
      switch (this.funcID){
        case "WPT0211":
          this.predicate = "CreatedBy=@0 ";
          this.option = "mypost";
          break;
        case "WPT0212":
          this.predicate = "Approver = @0";
          this.option = "webpost";
          break;
        default:
          this.entityName = 'WP_Comments'
          this.predicate = "Approver = @0"
          this.option = "post";
          break;
          
      }
      this.model.predicate = this.predicate;
      this.model.entityName = this.entityName;
      
    });
    this.getGridViewSetUp();
    this.loadTabAsside();
    this.dt.detectChanges();

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
    this.clickNavApprove(null,this.navAsside[0].predicate,this.navAsside[0].datavalue)
    this.dt.detectChanges();
  }

  getGridViewSetUp(){
    this.cache.functionList(this.funcID).subscribe((func) => {
      console.log('functuonID: ',func);
      this.cache.gridViewSetup(func?.formName, func?.gridViewName).subscribe((grd) => {
        this.gridViewSetUp = grd;
        console.log('gridViewSetUp: ',this.gridViewSetUp);
      })
    })
  }
  loadTabAsside(){
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetTotalAdminPostAsync",this.model).subscribe(
      (res) => {
        if(res){
          this.navAsside[0].value = res[0];
          this.navAsside[1].value = res[1];
          this.navAsside[2].value = res[2];
          this.navAsside[3].value = res[3];
          
          this.navAsside[0].active = true;
          this.navAsside[1].active = false;
          this.navAsside[2].active = false;
          this.navAsside[3].active = false;
        }
      }
    )
  }
  loadData(predicate:string,dataValue:string){
    this.codxViews.entityName = this.entityName;
    this.codxViews.dataService.setPredicate(predicate,[dataValue]).subscribe();
  }
  clickViewDetail(recID:string,entityName:string){
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetNewsInforByADMinAsync",[recID,entityName])
    .subscribe((res) => {
      if(res){
        this.dataSelected = res;
        this.dataDetail = res;
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
            this.navAsside[0].value--;
            this.navAsside[1].value++;
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
            this.navAsside[0].value--;
            this.navAsside[2].value++;
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
            // this.listView.removeHandler(data, 'recID');
            this.dataDetail = null;
            this.navAsside[0].value--;
            t.notifySvr.notifyCode("WP009");
            this.dt.detectChanges();
          }
        }
      );
    } 
  }

  clickNavApprove(item = null ,predicate:string,dataValue:string){
    if(!item){
      this.navAsside[0].active = true;
    }
    else{
      this.navAsside.map(x => {if(x.name != item.name) x.active = false;})
      item.active = true;
    }
    var predicateTemp = this.predicate + predicate;
    var dataValueTemp = this.dataValue + dataValue
    this.loadData(predicateTemp,dataValueTemp);
  }


  itemSelected : any;
  selectedChange(data: any) {
    this.itemSelected = data;
    this.dt.detectChanges();
  }

  clickMF(event:any,data:any){
    switch(event.functionID){
      case 'delete':
        if(this.entityName == "WP_News"){
          this.api.execSv(this.service,this.assemblyName,"NewsBusiness","DeleteNewsAsync",data.recID)
          .subscribe((res:boolean) => {
            if(res){
              this.notifySvr.notifyCode('E0026');
            }
          })
        }
        else //WP_Comments
        {
          this.api.execSv(this.service,this.assemblyName,"CommentBusiness","DeletePostAsync",data.recID)
          .subscribe((res:boolean) => {
            if(res){
              this.notifySvr.notifyCode('E0026');
            }
          })
        }
        break;
      case 'edit':
        let option = new SidebarModel();
        option.DataService = this.codxViews.dataService;
        option.FormModel = this.codxViews.formModel;
        this.callFuc.openSide(PopupAddComponent,data,option);
        break;
      default:
        break;
    }
  }
}
