import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DataRequest, CodxListviewComponent, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css']
})
export class ApproveComponent extends UIComponent implements OnInit {
  onInit(): void {
  }
  entityName = "";
  predicate = "";
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
  @ViewChild('template') template : TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef : TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate : TemplateRef<any>;


  @ViewChild('codxViews') codxViews : ViewsComponent;

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
  @ViewChild('listView') listView : CodxListviewComponent;
  constructor
  ( inject: Injector,
    private dt:ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private auth:AuthService,
    private route: ActivatedRoute
  ) 
  {
    super(inject);
  }
  ngAfterViewInit(): void {
    this.views  = [{
      type: ViewType.listdetail,
      active: true,
      model:{
        template : this.template,
        panelRightRef : this.panelRightRef
      }
    }]
    this.formModel = this.codxViews.formModel;
    this.getGridViewSetUp();
    this.clickNavApprove(null,this.navAsside[0].predicate,this.navAsside[0].datavalue);
  }

  OnInit(): void {
    this.route.params.subscribe((param) =>{
      var option = param["option"];
      this.funcID = param["funcID"];
      this.option = option;
      this.entityName = "WP_News";     
      this.predicate = "Approver=@0 ";
      this.dataValue =  this.auth.userValue.userID;
      this.model.predicate= this.predicate;
      this.model.dataValue = this.dataValue;
      switch (option){
        case "webpost":
          break;
        case "post":
          this.entityName = "WP_Comments";
          break;
        default:
          this.predicate = "CreatedBy=@0 ";
          this.model.predicate = "CreatedBy=@0";
          this.model.dataValue = this.auth.userValue.userID;
          break;
      }
      this.dataDetail = null;
      this.model.entityName = this.entityName;

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
            this.dt.detectChanges();
          }
        }
      )
      this.clickNavApprove(null,this.navAsside[0].predicate,this.navAsside[0].datavalue)
    });

  }


  getGridViewSetUp(){
    this.cache.functionList(this.codxViews.formModel.funcID).subscribe((func) => {
      this.cache.gridViewSetup(func?.formName, func?.gridViewName).subscribe((grd) => {
        this.gridViewSetUp = grd;
      })
    })
  }
  loadData(predicate:string,dataValue:string){
    if(this.listView)
    {
      this.listView.entityName =  this.entityName;
      this.listView.predicate = predicate;
      this.listView.dataValue = dataValue;
      this.dt.detectChanges();
    }
  }
  clickViewDetail(recID:string,entityName:string){
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetNewsInforByADMinAsync",[recID,entityName])
    .subscribe((res) => {
      if(res){
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

}
