import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, CRUDService, NotificationsService, SidebarModel, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subscription } from 'rxjs';
import { BusinesstripDetailComponent } from './businesstrip-detail/businesstrip-detail.component';
import { PopupAddBusinesstripComponent } from './popup/popup-add-businesstrip/popup-add-businesstrip.component';
import { PopupAddAdvanceComponent } from '../advance/popup-add-advance/popup-add-advance.component';
import { PopupAddPaymentComponent } from '../payment/popup/popup-add-payment/popup-add-payment.component';

@Component({
  selector: 'ep-businesstrip',
  templateUrl: './businesstrip.component.html',
  styleUrls: ['./businesstrip.component.css']
})
export class BusinesstripComponent extends UIComponent implements AfterViewInit,OnDestroy {
  
  user:UserModel = null;
  views:ViewModel[];
  subcriptions = new Subscription();
  runMode:string = "";
  releaseCategory:any;
  selectedID:any = null;
  btnAdd: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  
  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("detailTemplate") detailTemplate:TemplateRef<any>;
  @ViewChild("businestripDetail") businestripDetail:BusinesstripDetailComponent;
  constructor
  (
    private injector:Injector,
    private codxShareService:CodxShareService,
    private codxCommonSV : CodxCommonService,
    private notiSV:NotificationsService,
    private auth:AuthStore
  ) 
  {
    super(injector);
    this.user = this.auth.get();
    
  }
  override onInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type : ViewType.listdetail,
        sameData:true,
        showFilter:false,
        model:
        {
          template: this.itemTemplate,
          panelRightRef : this.detailTemplate
        }
      }
    ];
    let subcribeApi = this.api.execSv(
    'ES',
    'ERM.Business.ES',
    'CategoriesBusiness',
    'GetCategoryByEntityNameAsync',
    [this.view.entityName])
    .subscribe((res:any) => 
    {
      this.releaseCategory = res;
    });
    this.subcriptions.add(subcribeApi);
    this.detectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  selectedChange(event:any){
    if(!event) return;
    this.selectedID = event.recID;
    this.detectorRef.detectChanges();
  }

  changeDataMF(event:any,data:any){
    if (this.view?.function?.runMode == '1') 
    {
      this.codxShareService.changeMFApproval(event,data?.unbounds);
    }
  }

  clickMF(event:any, data = null){
    switch(event?.functionID)
    {
      case"SYS01":
        this.add();
        break;
      case"SYS02":
        if(!data) data = this.view.dataService.dataSelected;
        this.delete(data);
        break;
      case"SYS03":
        if(!data) data = this.view.dataService.dataSelected;
        this.update(data);
        break;
      case"SYS04":
        if(!data) data = this.view.dataService.dataSelected;
        this.coppy(data);
        break;
      case"SYS05":
        if(!data) data = this.view.dataService.dataSelected;
        this.viewDetail(data);
        break;
      case"WSCO0411":
        if(!data) data = this.view.dataService.dataSelected;
        this.openPopupAdvance(data);
        break;
      case"WSCO0412":
        if(!data) data = this.view.dataService.dataSelected;
        this.openPopupPayment(data);
        break;
      case"WSCO0413":
        if(!data) data = this.view.dataService.dataSelected;
        this.release(data);
        break;
      default:
        break;
    }
  }

  add(){
    this.view.dataService.addNew()
    .subscribe((data:any) => {
      if(data)
      {
        data.employeeID = this.user.employee?.employeeID;
        data.employeeName = this.user.employee?.employeeName;
        data.positionID = this.user.employee?.positionID;
        data.phone = this.user.mobile;
        data.email = this.user.email;
        data.requester = this.user.userID;
        data.requesterName = this.user.userName;
        let dialog = new SidebarModel();
        dialog.Width = '800px';
        dialog.FormModel = this.view.formModel;
        dialog.DataService = this.view.dataService;
        let obj = {
          data : data,
          actionType: "add"
        }
        let popup = this.callfc.openSide(PopupAddBusinesstripComponent,obj,dialog,this.view.funcID);
        this.subcriptions.add(popup.closed.subscribe((res:any) => {
          if(res.event)
          {
            let subcribeAdd = this.view.dataService.update(res.event).subscribe();
            this.subcriptions.add(subcribeAdd);
          }
        }));
      }
    });
  }

  delete(data:any){
    if(data)
    {
      let subcribeDelete = this.view.dataService.delete([data],true).subscribe();
      this.subcriptions.add(subcribeDelete);
      this.detectorRef.detectChanges();
    }
  }

  update(data:any){
    if(data)
    {
      let dialog = new SidebarModel();
      dialog.Width = '800px';
      dialog.FormModel = this.view.formModel;
      dialog.DataService = this.view.dataService;
      let obj = {
        data : JSON.parse(JSON.stringify(data)),
        actionType: "edit"
      }
      let popup = this.callfc.openSide(PopupAddBusinesstripComponent,obj,dialog,this.view.funcID);
      this.subcriptions.add(popup.closed.subscribe((res:any) => {
        if(res?.event)
        {
          this.view.dataService.update(res.event).subscribe();
        }
      }));
    }
  }

  coppy(data:any){
    if(data)
    {
      let subcribeCoppy =  this.view.dataService.copy()
      .subscribe((res:any) => {
        if(res)
        {
          let dialog = new SidebarModel();
          dialog.Width = '800px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = this.view.dataService;
          let obj = {
            data : res,
            actionType: "coppy",
            requestID : data.recID
          }
          let popup = this.callfc.openSide(PopupAddBusinesstripComponent,obj,dialog,this.view.funcID);
          this.subcriptions.add(popup.closed.subscribe((res:any) => {
            if(res?.event)
            {
              this.view.dataService.update(res.event).subscribe();
            }
          }));
        }
      });
      this.subcriptions.add(subcribeCoppy);
    }
  }

  viewDetail(data:any){
    if(data)
    {
      let dialog = new SidebarModel();
      dialog.Width = '800px';
      dialog.FormModel = this.view.formModel;
      dialog.DataService = this.view.dataService;
      let obj = {
        data : data,
        actionType: "view"
      }
      this.callfc.openSide(PopupAddBusinesstripComponent,obj,dialog,this.view.funcID);
    }
  }

  openPopupAdvance(data:any){
    if(data)
    {
      let subscribe = this.api.execSv("EP","Core","DataBusiness","GetDefaultAsync",["WSCO042","EP_Requests"])
      .subscribe((model:any) => {
        if(model && model?.data)
        {
          model.data.refID = data.recID;
          model.data.requestType = "AD";
          let obj = {
            data : model.data,
            actionType: "add"
          }
          let dataService = new CRUDService(this.injector);
          dataService.request.entityName = "EP_Requests";
          dataService.request.funcID = "WSCO042";
          dataService.service = "EP";
          dataService.request.formName = "AdvanceRequests";
          dataService.request.gridViewName = "grvAdvanceRequests";
          dataService.dataSelected = model.data;
          let dialog = new SidebarModel();
          dialog.Width = '550px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = dataService;
          this.callfc.openSide(PopupAddAdvanceComponent,obj,dialog,this.view.funcID);
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  openPopupPayment(data:any){
    if(data)
    {
      let subscribe = this.api.execSv("EP","EP","RequestsBusiness","CoppyRequestAsync",["WSCO043","EP_Requests",data.recID])
      .subscribe((model:any) => {
        if(model)
        {
          model.refID = data.recID;
          model.requestType = "PA";
          if(model.lines)
            model.totalAmount = model.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
          let obj = {
            data : model,
            actionType: "add"
          }
          let dataService = new CRUDService(this.injector);
          dataService.request.entityName = "EP_Requests";
          dataService.request.funcID = "WSCO042";
          dataService.service = "EP";
          dataService.request.formName = "AdvanceRequests";
          dataService.request.gridViewName = "grvAdvanceRequests";
          dataService.dataSelected = model;
          let dialog = new SidebarModel();
          dialog.Width = '550px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = dataService;
          this.callfc.openSide(PopupAddPaymentComponent,obj,dialog,this.view.funcID);
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  release(data:any){
    if(data)
    {
      this.codxCommonSV.codxReleaseDynamic("EP",data,this.releaseCategory,this.view.entityName,this.view.funcID,data.memo,(res) => {this.callBackRelease(res,this);});
    }
  }

  callBackRelease(res:any,t:any){
    if(res?.rowCount > 0)
    {
      t.notiSV.notify("Gửi duyệt thành công"); // chưa có mssgCode
      t.detectorRef.detectChanges();
    }
    else t.notiSV.notify("Gửi duyệt không thành công",2);
  }

  getRequestItem(recID:string){
    if(recID)
    {
      let subcribeApi =  this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,this.view.funcID])
      .subscribe((res:any) => {
        if(res)
        {
          this.view.dataService
          this.detectorRef.detectChanges();
        }
      });
      this.subcriptions.add(subcribeApi);
    }
  }
}
