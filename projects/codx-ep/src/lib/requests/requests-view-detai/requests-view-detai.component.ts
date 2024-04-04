import { AfterViewInit, Component, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { change } from '@syncfusion/ej2-angular-grids';
import { CRUDService, FormModel, ResponseModel, SidebarModel, UIDetailComponent, ViewsComponent } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddEpAdvanceRequestComponent } from '../../advance-requests/popup/popup-add-ep-advance-request/popup-add-ep-advance-request.component';
import { PopupAddRequestComponent } from '../popup/popup-add-request/popup-add-request.component';
import { Subscription } from 'rxjs';
import { PopupAddEpPaymentRequestComponent } from '../../payment-requests/popup/popup-add-ep-payment-request/popup-add-ep-payment-request.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'ep-requests-view-detai',
  templateUrl: './requests-view-detai.component.html',
  styleUrls: ['./requests-view-detai.component.css']
})
export class RequestsViewDetaiComponent extends UIDetailComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() formModel:FormModel;
  @Input() data:any;
  @Input() view:ViewsComponent;

  subcriptions = new Subscription();
  runMode:string = "";
  releaseCategory:any;

  constructor
  (
    private injector:Injector,
    private codxShareService:CodxShareService,
    private codxCommonSV : CodxCommonService
  ) 
  {
    super(injector);
  }
  

  override onInit(): void {
    let subcribe = this.cache.functionList(this.funcID)
    .subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
      }
    });
    this.subcriptions.add(subcribe);
    this.loadDataInfo(this.recID,this.funcID);
  }

  ngAfterViewInit(): void {
    let subcribe = this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetCategoryByEntityNameAsync',
      [this.view.entityName])
      .subscribe((res:any) => 
      {
        this.releaseCategory = res;
      });
      this.subcriptions.add(subcribe);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.recID && !changes.recID?.firstChange && changes.recID?.currentValue != changes.recID?.previousValue)
    {
      this.loadDataInfo(this.recID,this.funcID);
    }
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  loadDataInfo(recID:string,funcID:string){
    let subcribe =  this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,funcID])
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
    this.subcriptions.add(subcribe);
  }

  changeDataMF(event:any){
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, this.data?.unbounds);
    }
    else if(event)
    {

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
        case"WSCO0411":
          if(!data) data = this.view.dataService.dataSelected;
          this.openPopupAdvance(data);
          break;
        case"WSCO0412":
          if(!data) data = this.view.dataService.dataSelected;
          this.openPopupPayment(data);
          break;
        case "WSCO0413":
          this.sendApproval(this.data);
          break;
        default:
          break;
      }
    }
  }

  add(){
    if(this.view)
    {
      let subscribe = this.view.dataService
      .addNew()
      .subscribe((model:any) => {
        if(model)
        {
          let dialog = new SidebarModel();
          dialog.Width = '800px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = this.view.dataService;
          let obj = {
            data : model,
            actionType: "add"
          }
          let popup = this.callfc.openSide(PopupAddRequestComponent,obj,dialog,this.view.funcID);
          this.subcriptions.add(popup.closed.subscribe((res:any) => {
            if(res && res.event)
            {
              let subscribeUpdate = this.view.dataService.update(res.event).subscribe();
              this.subcriptions.add(subscribeUpdate);
            }
          }));
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  delete(data:any){
    if(data)
    {
      let subscribeDelete = this.view.dataService.delete([data],true).subscribe();
      this.subcriptions.add(subscribeDelete);
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
        data : data,
        actionType: "edit"
      }
      let popup = this.callfc.openSide(PopupAddRequestComponent,obj,dialog,this.view.funcID);
      this.subcriptions.add(popup.closed.subscribe((res:any) => {
        if(res && res.event)
        {
          this.subcriptions.add(this.view.dataService.update(res.event).subscribe());
          this.loadDataInfo(res.event.recID,this.view.funcID);
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
          this.callfc.openSide(PopupAddEpPaymentRequestComponent,obj,dialog,this.view.funcID);
        }
      });
      this.subcriptions.add(subscribe);
    }
  }

  sendApproval(data:any){
    let title = `${this.view.function.customName} - ${data.memo}`; 
    this.codxCommonSV.codxReleaseDynamic("EP",data,this.releaseCategory,this.view.entityName,this.view.funcID,title,this.callBackApproval);
  }

  callBackApproval(res:any){
    if(res?.rowCount > 0)
    {
      this.data.status = res.returnStatus;
      this.view.dataService.dataSelected.status = res.returnStatus;
      this.detectorRef.detectChanges();
    }
  }
}
