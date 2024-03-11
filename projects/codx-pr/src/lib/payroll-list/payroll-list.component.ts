import { AfterViewInit, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DialogModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddPayrollListComponent } from './popup/popup-add-payroll-list/popup-add-payroll-list.component';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PayrollListComponent extends UIComponent implements AfterViewInit {
  
  views:ViewModel[];
  @ViewChild("tmpContent") tmpContent:TemplateRef<any>;
  @ViewChild("headerTemplate") headerTemplate:TemplateRef<any>;
  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("tmpGroup") tmpGroup:TemplateRef<any>;
  @ViewChild("ej2Uploader") ej2Uploader: UploaderComponent;

  constructor
  (
    private injector:Injector,
    private notiSV:NotificationsService,
    private router2: Router,
  )
  {
    super(injector);

  }
  override onInit(): void {
    
  }


  views2:ViewModel[];
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        sameData: true,
        model : 
        {
          headerTemplate : this.headerTemplate,
          collapsed : true,
          template : this.itemTemplate,
          groupBy: 'yearID',
          groupTemplate: this.tmpGroup
        }
      }
    ];
  }

  changeDataMF(event:any){
    event.forEach(element => {
     if(element.functionID === "PRTPro19A15" || element.functionID === "SYS02")
     {
       element.disabled = false;
       element.isbookmark = true;
       element.isblur = false;
     }
     else element.disabled = true;
    }); 
  }

  clickMF(event:any){
    switch(event.functionID)
    {
      case"PRTPro19A15":
        this.add();
        break;
      case"SYS02":
        this.delete(this.view.dataService.dataSelected);
        break;
    }
  }

  delete(data:any){
    this.notiSV.alertCode("SYS030")
    .subscribe((confirm:any) => {
      if(confirm && confirm.event.status === "Y")
      {
        this.api.execSv("HR","PR","PayrollListBusiness","DeleteAsync",data)
        .subscribe((res:any) => {
          if(res) 
          {
            this.notiSV.notifyCode("SYS008");
            this.view.dataService.remove(data).subscribe();
          }
          else this.notiSV.notifyCode("SYS022");
        });
      }
    })
  }

  add(){
    this.view.dataService.addNew()
    .subscribe((model:any) => {
      if(model)
      {
        let dialogModel = new DialogModel();
        dialogModel.FormModel = this.view.formModel;
        dialogModel.DataService = this.view.dataService;
        let obj = {
          data: model,
          headerText: "Tính lương"
        };
        this.callfc.openForm(PopupAddPayrollListComponent,"",500,500,this.view.funcID,obj,"",dialogModel)
        .closed.subscribe((res:any) => {
          if(res && res?.event)
          {
            this.view.dataService.add(res.event).subscribe();
          }
        });
      }
    });
  }


  valueChange(){

  }

  viewDetailPayroll(data:any){
    if(data.payrollID)
    {
      this.router2.navigateByUrl(this.router2.url + "/" + data.payrollID);
    }
  }
 
}
