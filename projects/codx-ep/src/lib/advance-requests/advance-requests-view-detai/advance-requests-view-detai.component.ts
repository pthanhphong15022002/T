import { AfterViewInit, Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UIDetailComponent, FormModel, CRUDService, SidebarModel, ViewsComponent } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subscription } from 'rxjs';
import { PopupAddRequestComponent } from '../../requests/popup/popup-add-request/popup-add-request.component';
import { PopupAddEpAdvanceRequestComponent } from '../popup/popup-add-ep-advance-request/popup-add-ep-advance-request.component';
import { PopupAddEpPaymentRequestComponent } from '../../payment-requests/popup/popup-add-ep-payment-request/popup-add-ep-payment-request.component';

@Component({
  selector: 'ep-advance-requests-view-detai',
  templateUrl: './advance-requests-view-detai.component.html',
  styleUrls: ['./advance-requests-view-detai.component.css']
})
export class AdvanceRequestsViewDetaiComponent extends UIDetailComponent implements OnChanges, AfterViewInit {

  @Input() formModel:FormModel;
  @Input() data:any;
  @Input() view:ViewsComponent;

  runMode:string = "";
  subcriptions = new Subscription();
  constructor
  (
    private injector:Injector,
    private codxShareService:CodxShareService
  ) 
  {
    super(injector);
  }

  override onInit(): void {
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
      }
    });
    this.loadDataInfo(this.recID,this.funcID);
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.recID && !changes.recID?.firstChange && changes.recID?.currentValue != changes.recID?.previousValue)
    {
      this.loadDataInfo(this.recID,this.funcID);
    }
  }

  loadDataInfo(recID:string,funcID:string){
    this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,funcID])
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  changeDataMF(event:any){
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, this.data?.unbounds);
    }
    // else if(event)
    // {
    //   event.map(x => {
    //     if(x.functionID == "SYS01" || x.functionID == "SYS02" || x.functionID == "SYS03" || x.functionID == "WSCO0411" || x.functionID == "WSCO0412")
    //       x.disabled = false;
    //     else
    //       x.disabled = true;
    //   });
    // }
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
          dialog.Width = '550px';
          dialog.FormModel = this.view.formModel;
          dialog.DataService = this.view.dataService;
          let obj = {
            data : model,
            actionType: "add"
          }
          let popup = this.callfc.openSide(PopupAddEpAdvanceRequestComponent,obj,dialog,this.view.funcID);
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
      dialog.Width = '550px';
      dialog.FormModel = this.view.formModel;
      dialog.DataService = this.view.dataService;
      let obj = {
        data : data,
        actionType: "edit"
      }
      let popup = this.callfc.openSide(PopupAddEpAdvanceRequestComponent,obj,dialog,this.view.funcID);
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
}
