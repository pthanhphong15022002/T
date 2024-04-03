import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, SidebarModel, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';
import { Subscription } from 'rxjs';
import { PopupAddRequestComponent } from './popup/popup-add-request/popup-add-request.component';

@Component({
  selector: 'ep-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent extends UIComponent implements AfterViewInit,OnDestroy {
  

  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("detailTemplate") detailTemplate:TemplateRef<any>;

  user:UserModel = null;
  views:ViewModel[];
  subcriptions = new Subscription();
  dataSelected:any;
  constructor
  (
    injector:Injector,
    auth:AuthStore
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
        if(x.functionID == "SYS01")
        { 
          x.disabled = false;
          x.isbookmark = true;
        }
        else
          x.disabled = true;
      });
    }
  }

  clickMF(event:any){
    if(event)
    {
      switch(event.functionID)
      {
        case"SYS01":
          this.openPopupAdd();
          break;
      }
    }
  }

  openPopupAdd(){
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
              this.subcriptions.add(this.view.dataService.add(res.event).subscribe());
            }
          }));
        }
      });
      this.subcriptions.add(subscribe);
    }
  }
}
