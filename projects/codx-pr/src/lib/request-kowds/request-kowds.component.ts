import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CodxService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

import { ViewDetailRequestKowDsComponent } from './view-detail-request-kowds/view-detail-request-kowds.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'request-kowds',
  templateUrl: './request-kowds.component.html',
  styleUrls: ['./request-kowds.component.css'],
})
export class RequestKowDsComponent extends UIComponent implements AfterViewInit {

  @HostBinding('class') get valid() { return "w-100 h-100"; }
  views: Array<ViewModel>;
  selectedID:string = "";
  runMode:string;
  @ViewChild('viewdetail') viewdetail: ViewDetailRequestKowDsComponent;
  @ViewChild('panelRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  constructor
  (
    injector: Injector,
    private codxShareSV:CodxShareService
  ) 
  {
    super(injector);
    this.router.params.subscribe((params:any) => {
      if(params && params?.funcID)
      {
        this.cache.functionList(params.funcID)
        .subscribe((func:any) => {
          if(func && func.runMode)
            this.runMode = func.runMode;
        });
      }
    });
  }
  onInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight
        }
      }
    ];    
    this.detectorRef.detectChanges();
  }

  // show/hidel morefunc
  changeDataMF(event:any,data:any) {
    if (this.runMode == '1') // form xét duyệt
    {
      this.codxShareSV.changeMFApproval(event, data?.unbounds);
    } 
    else // form nghiệp vụ
    {
      // event.forEach((func) => {
      //   if(func.functionID == 'SYS02' ||  func.functionID == 'SYS03' || func.functionID == 'SYS04') 
      //   { 
      //     func.disabled = false;
      //     func.isbookmark = true;
      //   }
      //   else func.disabled = true;
      // });
      event.forEach((func) => func.disabled = true);
    }
   
  }

  // on selected change
  selectedChange(event:any) {
    this.selectedID = event.recID;
    this.detectorRef.detectChanges();
  }

  clickMF(event:any) {    
    
  }
  
}
