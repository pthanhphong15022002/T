import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { CodxGridviewV2Component, DialogModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddPayrollListComponent } from './popup/popup-add-payroll-list/popup-add-payroll-list.component';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Template } from 'ngx-basic-primitives/lib/diagrams/graphics';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pr-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css']
})
export class PayrollListComponent extends UIComponent implements AfterViewInit {
  
  views:ViewModel[];
  @ViewChild("tmpContent") tmpContent:TemplateRef<any>;
  @ViewChild("headerTemplate") headerTemplate:TemplateRef<any>;
  @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
  @ViewChild("ej2Uploader") ej2Uploader: UploaderComponent;

  constructor
  (
    private injector:Injector,
    private router2: Router ,
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
          template : this.itemTemplate
        }
      }
    ];
  }

  changeDataMF(event:any){
    event.forEach(element => {
     if(element.functionID === "SYS01" || element.functionID === "SYS02")
     {
       element.disabled = false;
       element.isbookmark = true;
       element.isblur = false;
     }
     else element.disabled = true;
    }); 
  }

  clickMF(event:any, data = null){
    switch(event.functionID)
    {
      case"SYS01":
        this.add();
        break;
      case"SYS01":
        this.view.dataService.delete([this.view.dataService.dataSelected],true).subscribe();
        break;
    }
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
