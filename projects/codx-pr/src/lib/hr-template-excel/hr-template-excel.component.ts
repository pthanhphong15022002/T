import { AfterViewInit, Component, HostBinding, Injector, TemplateRef, ViewChild } from '@angular/core';
import { DialogModel, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupEditTemplateComponent } from './popup/popup-edit-template/popup-edit-template.component';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { ViewDetailTemplateComponent } from './view-detail-template/view-detail-template.component';

@Component({
  selector: 'pr-template-excel',
  templateUrl: './hr-template-excel.component.html',
  styleUrls: ['./hr-template-excel.component.css']
})
export class HrTemplateExcelComponent extends UIComponent implements AfterViewInit {

  @HostBinding('class') get valid() { return "w-100 h-100"; }
  views:ViewModel[];
  function:any;
  selectedID:string = "";
  @ViewChild("itemTmpLeft") itemTmpLeft:TemplateRef<any>;
  @ViewChild("tmpPanelRight") tmpPanelRight:TemplateRef<any>;
  @ViewChild("detailTemplate") detailTemplate:ViewDetailTemplateComponent;
  constructor
  (
    private injector:Injector,
    private notiSV:NotificationsService
  ) 
  {
    super(injector);
    this.router.params
    .subscribe((params:any) => {
      if(params && params?.funcID)
      {
        this.cache.functionList(params.funcID)
        .subscribe((func:any) => {
            this.function = func;
        });
      }
    });
  }

  override onInit(): void {
  }


  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model : {
          template: this.itemTmpLeft,
          panelRightRef:this.tmpPanelRight,
        }
      }
    ]
    
  }

  selectedChange(event:any){
    if(event)
    {
      this.selectedID = event.hrTemplateID;
      this.detectorRef.detectChanges();
    }
  }

  clickMF(event:any, data = null){
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
        this.edit(data);
        break;
    }
  }

  add(){
    let sidebarModel = new SidebarModel();
    sidebarModel.FormModel = this.view.formModel;
    sidebarModel.Width = '550px';
    this.view.dataService.addNew()
    .subscribe((model:any) => {
      if(model)
      {
        let option = {
          action:'add',
          data: model,
          headerText: "Chi tiết bảng lương"
        };
        this.callfc.openSide(PopupEditTemplateComponent,option,sidebarModel,this.funcID)
        .closed.subscribe((res:any) => 
        {
          if(res && res.event)
          {
            this.view.dataService.add(res.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      }
    });
  }

  edit(data:any){
    let sidebarModel = new SidebarModel();
    sidebarModel.FormModel = this.view.formModel;
    sidebarModel.Width = '550px';
    let option = {
      action:'edit',
      data: data,
      headerText: "Chi tiết bảng lương"
    };
    this.callfc.openSide(PopupEditTemplateComponent,option,sidebarModel,this.funcID)
    .closed.subscribe((res:any) => 
    {
      if(res && res.event)
      {
        this.view.dataService.update(res.event).subscribe();
        this.detailTemplate.loadData(res.event.hrTemplateID);
        this.detectorRef.detectChanges();
      }
    });
  }

  delete(data:any){
    if(data)
    {
      this.notiSV.alertCode("SYS003")
      .subscribe((confirm:any) => {
        if(confirm && confirm?.event?.status === "Y")
        {
          this.api.execSv("HR","HR","TemplateExcelBusiness","DeleteAsync",data)
          .subscribe((res:any) => {
            if(res)
            {
              this.view.dataService.remove(data).subscribe();
              this.notiSV.notifyCode("SYS008");
              this.selectedID = "";
            }
            else this.notiSV.notifyCode("SYS022");
          });
        }
      })
    }
  }

  changeDataMF(event:any){
     event.forEach(element => {
      if(element.functionID === "SYS01" || element.functionID === "SYS02" || element.functionID === "SYS03")
      {
        element.disabled = false;
        element.isbookmark = element.functionID === "SYS01";
      }
      else element.disabled = true;
     }); 
  }

  
}
