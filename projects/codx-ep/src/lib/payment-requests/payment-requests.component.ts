import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, UserModel, ViewModel, AuthStore, ViewType, SidebarModel, CRUDService } from 'codx-core';
import { Subscription } from 'rxjs';
import { PopupAddEpAdvanceRequestComponent } from '../advance-requests/popup/popup-add-ep-advance-request/popup-add-ep-advance-request.component';
import { PopupAddEpPaymentRequestComponent } from './popup/popup-add-ep-payment-request/popup-add-ep-payment-request.component';

@Component({
  selector: 'ep-payment-requests',
  templateUrl: './payment-requests.component.html',
  styleUrls: ['./payment-requests.component.css']
})
export class PaymentRequestsComponent extends UIComponent {

  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("detailTemplate") detailTemplate:TemplateRef<any>;

  user:UserModel = null;
  views:ViewModel[];
  subcriptions = new Subscription();
  dataSelected:any;
  constructor
  (
    private injector:Injector,
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
            let data = {
              recID : res.event.recID,
              employeeID : res.event.employeeID,
              employeeName : res.event.employeeName,
              memo : res.event.memo,
              toDate : res.event.toDate,
              status : res.event.status,
              createdBy : res.event.createdBy
            };
            this.subcriptions.add(this.view.dataService.add(data).subscribe());
          }
        }));
      }
    });
    this.subcriptions.add(subscribe);
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
      let popup = this.callfc.openSide(PopupAddEpPaymentRequestComponent,obj,dialog,this.view.funcID);
      this.subcriptions.add(popup.closed.subscribe((res:any) => {
        if(res && res.event)
        {
          let dataItem = res.event;
          if(dataItem.resources?.length > 0)
            dataItem.resourceIDs = dataItem.resources.map(x => x.userID).join(";");
          this.subcriptions.add(this.view.dataService.update(data).subscribe());
          this.detectorRef.detectChanges();
        }
      }));
    }
  }
}
