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
  AuthStore,
  CacheService,
  NotificationsService,
  UIComponent,
  ViewType,
} from 'codx-core';

import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxPrService } from '../codx-pr.service';
import { ViewDetailRequestKowDsComponent } from './view-detail-request-kowds/view-detail-request-kowds.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'request-kowds',
  templateUrl: './request-kowds.component.html',
  styleUrls: ['./request-kowds.component.css'],
})
export class RequestKowDsComponent extends UIComponent implements AfterViewInit{


  @HostBinding('class') get valid() { return "w-100 h-100"; }
  views: any[];
  formModel: any;
  grvSetup: any;
  //View
  service = 'HR';
  assemblyName = 'PR';
  entity = 'HR_Request';
  className = 'KowDsBusiness';
  method = 'LoadRequestAsync';
  idField = 'recID';
  runMode= null;
  @ViewChild('viewdetail') viewdetail: ViewDetailRequestKowDsComponent;
  @ViewChild('panelRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  itemDetail: any;
  funcList: any;
  selectRecID: any;
  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private codxPrService: CodxPrService,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.funcList=func;
      }
    });
  }
  onInit(): void {
    this.codxPrService.getFormModel(this.funcID).then((fm) => {
    if (fm) {
      this.formModel = fm;

      this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grvSetup = grv;
        }
      });
     
    }
  });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
          
        },
      },
    ];    
    this.detectorRef.detectChanges();
  }
  changeDataMF(evt: any, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(evt, data?.unbounds);
    } else {      
        evt.forEach((func) => {
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == "SYS02" ||
            func.functionID == "SYS03" ||
            func.functionID == "SYS04" 
          ) {
            func.disabled = true;
          }
          
        });
    }
  }
  changeItemDetail(event) {
    //this.itemDetail = event?.data;
    this.selectRecID = event?.data?.recID;
  }
  clickMF(event: any, data) {    
    if(!data) data = this.view?.dataService?.dataSelected;
    if(!data && this.view?.dataService?.data?.length>0) {
      data = this.view?.dataService?.data[0];
      this.view.dataService.dataSelected = data;
    } 
    //this.viewdetail.openFormFuncID(event, data);
  }
  
}
