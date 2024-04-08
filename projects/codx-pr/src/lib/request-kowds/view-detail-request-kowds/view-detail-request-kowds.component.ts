import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CodxGridviewV2Component,
  FormModel,
  UIDetailComponent,
} from 'codx-core';

import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'view-detail-request-kowds',
  templateUrl: './view-detail-request-kowds.component.html',
  styleUrls: ['./view-detail-request-kowds.component.css'],
})
export class ViewDetailRequestKowDsComponent extends UIDetailComponent implements OnChanges, AfterViewInit {

  @HostBinding('class') get valid() { return "d-block w-100 h-100"; }
  @Input() runMode:string;
  @Input() formModel:FormModel;
  @Input() hideMF:boolean = true;
  @Input() hideFooter:boolean = false;

  @ViewChild('codxGrvV2') codxGrvV2: CodxGridviewV2Component;
  @ViewChild('tmpCellEmp') tmpCellEmp: TemplateRef<any>;
  @ViewChild('tmpCellKow') tmpCellKow: TemplateRef<any>;
  @ViewChild("tmpPopupNoteKow") tmpPopupNoteKow:TemplateRef<any>;
  data: any;
  loaded = false;
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: 'icon-i-clock-history',
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: 'icon-i-paperclip',
    },
    {
      name: 'Comment',
      textDefault: 'Bình luận',
      isActive: false,
      icon: 'icon-i-chat-right',
    },
  ];
  gridColumns = [];
  rowCount:number = 0;
  lstHRKow:any[] = [];
  vllHR033:any = {};
  constructor
  (
    injector: Injector,
    private codxShareService: CodxShareService,
  ) 
  {
    super(injector);
  }

  onInit(): void {
    this.cache.valueList("HR033")
    .subscribe((vll:any) => {
      if(vll && vll.datas)
      {
        vll.datas.forEach((element) => {
          this.vllHR033[element.value] = element;
        });
      }
    });
    this.loadData(this.formModel.funcID,this.recID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.recID && changes.recID.currentValue !== changes.recID.previousValue)
    {
      this.loadData(this.formModel.funcID,this.recID);
      this.codxGrvV2?.refresh();
      this.detectorRef.detectChanges();
    }
  }

  // get data info
  loadData(funcID,recID:string) {
    if(funcID && recID)
    {
      this.api
      .execSv('HR', 'ERM.Business.HR', 'RequestBusiness_Old', 'GetByIDAsync', [funcID,recID])
      .subscribe((res: any) => {
        this.data = res;
        this.detectorRef.detectChanges();
      });
    }
    
  }


  ngAfterViewInit(): void {
    this.getColSummaryKowd();
    setTimeout(() => {
      this.setDetailBody();
    },2000);
  }

  // get column grid for gridview summary kowd
  getColSummaryKowd(){
    this.gridColumns = [];
    this.gridColumns.push({
      template: this.tmpCellEmp,
      field: 'employeeID'
    });
    this.api.execSv("HR","HR","KOWsBusiness_Old","GetAsync")
    .subscribe((res:any) => {
        if (res && res?.length > 0) 
        {
          this.lstHRKow = [...res];
          res.forEach((kow) => {
            this.gridColumns.push({
              headerTemplate: `<div class="fw-bolder text-primary text-center">${kow.kowID}</div>`,
              template: this.tmpCellKow,
              field: kow.kowID,
              refField: 'kowCode'
            });
          });
          this.loaded = true;
          this.detectorRef.detectChanges();
        }
    });
  }

  // show/hide mfc
  changeDataMF(event: any, data: any) {
    if (this.runMode == '1') // form xét duyệt
    {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } 
    else // form nghiệp vụ
    {
      event.forEach((func) => func.disabled = true);
    }
  }

  
  openPopupNote() {
    if(this.lstHRKow && this.lstHRKow?.length > 0)
    {
      this.callfc.openForm(this.tmpPopupNoteKow,'',400,500);
    }
  }

  onDatabound(){
    this.rowCount = this.codxGrvV2.dataService.rowCount;
  }

  setDetailBody(){
    var header = document.getElementsByClassName("codx-detail-header")[0] as HTMLElement;
    var body = document.getElementsByClassName("codx-detail-body")[0] as HTMLElement;
    if(header && body)
    {
      header.classList.remove("mt-3");
      body.classList.remove("mt-2");
      body.style.setProperty("height",`calc(100% - ${header.clientHeight}px)`);
    }
  }
}
