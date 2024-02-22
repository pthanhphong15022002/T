import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'pr-template-excel',
  templateUrl: './hr-template-excel.component.html',
  styleUrls: ['./hr-template-excel.component.css']
})
export class HrTemplateExcelComponent extends UIComponent implements AfterViewInit {


  views:ViewModel[];
  function:any;
  selectedID:string = "";
  @ViewChild("itemTmpLeft") itemTmpLeft:TemplateRef<any>;
  @ViewChild("tmpPanelRight") tmpPanelRight:TemplateRef<any>;

  constructor
  (
    private injector:Injector
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
        showFilter: false,
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
}
