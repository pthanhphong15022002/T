import { AfterViewInit, Component, Injector, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';
import { Subscription } from 'rxjs';

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
      this.dataSelected = event;
      this.detectorRef.detectChanges();
    }
  }

}
