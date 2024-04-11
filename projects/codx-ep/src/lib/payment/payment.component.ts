import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, UserModel, ViewModel, ButtonModel, NotificationsService, AuthStore, ViewType, SidebarModel, CRUDService } from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subscription } from 'rxjs';
import { PopupAddAdvanceComponent } from '../advance/popup-add-advance/popup-add-advance.component';
import { PopupAddPaymentComponent } from './popup/popup-add-payment/popup-add-payment.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';

@Component({
  selector: 'ep-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent extends UIComponent implements AfterViewInit,OnDestroy {
  
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
  @ViewChild("paymentDetail") paymentDetail:PaymentDetailComponent;
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
      case"WSCO0413":
      case"WSCO0431":

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
        dialog.Width = '550px';
        dialog.FormModel = this.view.formModel;
        dialog.DataService = this.view.dataService;
        let obj = {
          data : data,
          actionType: "add"
        }
        let popup = this.callfc.openSide(PopupAddPaymentComponent,obj,dialog,this.view.funcID);
        this.subcriptions.add(popup.closed.subscribe((res:any) => {
          if(res && res.event)
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
      dialog.Width = '550px';
      dialog.FormModel = this.view.formModel;
      dialog.DataService = this.view.dataService;
      let obj = {
        data : data,
        actionType: "edit"
      }
      let popup = this.callfc.openSide(PopupAddPaymentComponent,obj,dialog,this.view.funcID);
      this.subcriptions.add(popup.closed.subscribe((res:any) => {
        if(res?.event?.recID)
        {
          this.paymentDetail.loadRequestDetail(res.event.recID);
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
          dialog.Width = '550px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = this.view.dataService;
          let obj = {
            data : res,
            actionType: "coppy",
            requestID : data.recID
          }
          let popup = this.callfc.openSide(PopupAddPaymentComponent,obj,dialog,this.view.funcID);
          this.subcriptions.add(popup.closed.subscribe((res:any) => {
            if(res?.event?.recID)
            {
              this.paymentDetail.loadRequestDetail(res.event.recID);
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
      dialog.Width = '550px';
      dialog.FormModel = this.view.formModel;
      dialog.DataService = this.view.dataService;
      let obj = {
        data : data,
        actionType: "view"
      }
      this.callfc.openSide(PopupAddPaymentComponent,obj,dialog,this.view.funcID);
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
      t.notiSV.notify("SYS019");
      t.view.dataService.dataSelected.status =  res.returnStatus;
      t.view.dataService.update(t.view.dataService.dataSelected).subscribe();
      t.detectorRef.detectChanges();
    }
    else if(res.msgCodeError == "ES028")
    {
      this.updateStatus(t.view.dataService.dataSelected);
    }
    else t.notiSV.notify("Gửi duyệt không thành công","2");
  }

  updateStatus(data:any){
    if(data)
    {
      let subcribeApi =  this.api.execSv("EP","EP","RequestsBusiness","UpdateStatusAsync",data.recID)
      .subscribe((res:any) => {
        if(res)
        {
          this.view.dataService.dataSelected.status = "5";
          this.paymentDetail.loadRequestDetail(this.view.dataService.dataSelected.recID);
          this.notiSV.notifyCode("SYS019"); 
        }
        else this.notiSV.notify("Gửi duyệt không thành công","2");
      });
      this.subcriptions.add(subcribeApi);
    }
  }
}
