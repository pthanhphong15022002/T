import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, UserModel, ViewModel, AuthStore, ViewType, SidebarModel, CRUDService, CodxService } from 'codx-core';
import { Subscription } from 'rxjs';
import { PopupAddEpAdvanceRequestComponent } from '../advance-requests/popup/popup-add-ep-advance-request/popup-add-ep-advance-request.component';
import { PopupAddEpPaymentRequestComponent } from './popup/popup-add-ep-payment-request/popup-add-ep-payment-request.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { ResponseModel } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { PaymentRequestsViewDetaiComponent } from './payment-requests-view-detai/payment-requests-view-detai.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'ep-payment-requests',
  templateUrl: './payment-requests.component.html',
  styleUrls: ['./payment-requests.component.css']
})
export class PaymentRequestsComponent extends UIComponent {

  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("detailTemplate") detailTemplate:TemplateRef<any>;
  @ViewChild("viewDetail") viewDetail:PaymentRequestsViewDetaiComponent;


  user:UserModel = null;
  views:ViewModel[];
  subcriptions = new Subscription();
  dataSelected:any;
  releaseCategory:any;
  constructor
  (
    private injector:Injector,
    private codxCommonSV : CodxCommonService,
    private codxShareService:CodxShareService,
    private auth:AuthStore
  ) 
  {
    super(injector);
    this.user = auth.get();
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
    this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetProcessByCategoryIDAsync',
      [this.view.entityName]
    ).subscribe((res:any) => {
      this.releaseCategory = res;
    });
    this.detectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  selectedChange(event:any){
    if(event)
    {
      this.dataSelected = event.data;
      this.detectorRef.detectChanges();
    }
  }

  changeDataMF(event:any){
    if(event)
    {
      event.map(x => {
        if(x.functionID == "SYS01" || x.functionID == "SYS02" || x.functionID == "SYS03" || x.functionID == "WSCO0411" || x.functionID == "WSCO0412")
        { 
          x.disabled = false;
          x.isbookmark = true;
        }
        else
          x.disabled = true;
      });
    }
  }

  clickMF(event:any, data = null){
    if(event)
    {
      switch(event.functionID)
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
        case "Gửi duyệt":
          if(!data) data = this.view.dataService.dataSelected;
          this.release(data);
          break;
        default:
          break;
      }
    }
  }

  add(){
    let subscribe = this.view.dataService
    .addNew()
    .subscribe((model:any) => {
      if(model)
      {
        let dialog = new SidebarModel();
        dialog.Width = '550px';
        dialog.FormModel = this.view.formModel;
        dialog.DataService = this.view.dataService;
        let obj = {
          data : model,
          actionType: "add"
        }
        let popup = this.callfc.openSide(PopupAddEpPaymentRequestComponent,obj,dialog,this.view.funcID);
        this.subcriptions.add(popup.closed.subscribe((res:any) => {
          if(res && res.event)
          {
            this.subcriptions.add(this.view.dataService.update(res.event).subscribe());
          }
        }));
      }
    });
    this.subcriptions.add(subscribe);
  }

  delete(data:any){
    if(data)
    {
      this.subcriptions.add(this.view.dataService.delete([data],true).subscribe());
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
      let popup = this.callfc.openSide(PopupAddEpPaymentRequestComponent,obj,dialog,this.view.funcID);
      this.subcriptions.add(popup.closed.subscribe((res:any) => {
        if(res && res.event)
        {
          this.subcriptions.add(this.view.dataService.update(res.event).subscribe());
          this.viewDetail.loadDataInfo(res.event,this.view.funcID);
          this.detectorRef.detectChanges();
        }
      }));
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
          this.callfc.openSide(PopupAddEpAdvanceRequestComponent,obj,dialog,this.view.funcID);
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  openPopupPayment(data:any){
    if(data)
    {
      let subscribe = this.api.execSv("EP","Core","DataBusiness","GetDefaultAsync",["WSCO043","EP_Requests"])
      .subscribe((model:any) => {
        if(model && model?.data)
        {
          model.data.refID = data.recID;
          model.data.requestType = "PA";
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
          this.callfc.openSide(PopupAddEpAdvanceRequestComponent,obj,dialog,this.view.funcID);
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  release(data:any){
    if(data)
    {
      this.codxCommonSV.codxReleaseDynamic("EP",data,this.releaseCategory,this.view.entityName,this.view.funcID,data.memo,(res:ResponseModel) => {this.callbackRelase(res);});
    }
  }

  callbackRelase(respone:ResponseModel)
  {
    debugger
  }
}
