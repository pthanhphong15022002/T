import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxGridviewV2Component, DialogModel, ViewsComponent } from 'codx-core';
import { PopupAnnualLeaveMonthComponent } from '../popup-annual-leave-month/popup-annual-leave-month.component';

@Component({
  selector: 'lib-employee-annual-leave-by-org',
  templateUrl: './employee-annual-leave-by-org.component.html',
  styleUrls: ['./employee-annual-leave-by-org.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeAnnualLeaveByOrgComponent {
  @Input() funcID: string = 'HRTAL01';
  @Input() grvSetup: any;
  @Input() grvDaysOff: any;
  @Input() orgUnitID: string = '';
  @Input() showRowNumber: boolean = false;
  @Input() formModel: any;
  @Input() rowHeight: number;
  @Input() view: any;
  @Input() monthHeaderText: string = '';
  @Input() searchText: string = '';


  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('colEmployeeHeaderHRTAL01') colEmployeeHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colALYearHeaderHRTAL01') colALYearHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colALStandardHeaderHRTAL01') colALStandardHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colALRemainHeaderHRTAL01') colALRemainHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colUsedHeaderHRTAL01') colUsedHeaderHRTAL01: TemplateRef<any>;

  @ViewChild('colEmployeeHRTAL01') colEmployeeHRTAL01: TemplateRef<any>;
  @ViewChild('colALYearHRTAL01') colALYearHRTAL01: TemplateRef<any>;
  @ViewChild('colALStandardHRTAL01') colALStandardHRTAL01: TemplateRef<any>;
  @ViewChild('colALRemainHRTAL01') colALRemainHRTAL01: TemplateRef<any>;
  @ViewChild('colUsedHRTAL01') colUsedHRTAL01: TemplateRef<any>;

  service = 'HR';
  entityName = 'HR_EAnnualLeave';
  assemblyName = 'ERM.Business.HR';
  className = 'EAnnualLeavesBusiness';
  method = 'GetListEmployeeAnnualLeaveGrvV2Async';
  idField = 'recID';
  predicates = '@0.Contains(EmployeeID) && @1 == ALYear';
  dataValues = '';

  pageIndex = 0;
  pageSize = 5;
  listDaysOff: any = [];
  currentItem: any;
  scrolling: boolean = true;

  columnsGrid: any;

  popupLoading: boolean = false;

  inputTimes = 0;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private routerActive: ActivatedRoute,
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService
  ) {
    this.routerActive.params.subscribe((params: Params) => {
      this.funcID = params['funcID'];
    })
  }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    if (this.grvSetup)
      this.initGridColumn();
    this.detectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.orgUnitID) this.orgUnitID = changes.orgUnitID.currentValue;
    if(changes?.searchText != null) this.searchText = changes.searchText.currentValue;
    this.dataValues = this.orgUnitID + ';' + this.searchText;
    let ins = setInterval(() => {
      if (this.grid) {
        this.grid.dataService.rowCount = 0;
        this.grid.dataService.data = [];
        clearInterval(ins);
        this.grid.refresh();
      }
    }, 500);    
    this.detectorRef.detectChanges();
    if (this.inputTimes < 2) this.inputTimes++;
  }
  initGridColumn() {
    this.columnsGrid = [
      {
        headerTemplate: this.colEmployeeHeaderHRTAL01,
        template: this.colEmployeeHRTAL01,
        width: '200',
      },
      {
        headerTemplate: this.colALYearHeaderHRTAL01,
        template: this.colALYearHRTAL01,
        width: '50',
      },
      {
        headerTemplate: this.colALStandardHeaderHRTAL01,
        template: this.colALStandardHRTAL01,
        width: '200',
      },
      {
        headerTemplate: this.colALRemainHeaderHRTAL01,
        template: this.colALRemainHRTAL01,
        width: '150',
      },
      {
        headerTemplate: this.colUsedHeaderHRTAL01,
        template: this.colUsedHRTAL01,
        width: '100',
      },
    ]
  }
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
    }
  }
  onShowDaysOff(data: any) {
    if (data?.recID != this.currentItem?.recID) {
      this.resetPage();
      this.currentItem = data;
    }
    if (this.listDaysOff?.length <= 0)
      this.popupLoading = true;

    this.api.execSv('HR', 'ERM.Business.HR', 'EAnnualLeavesBusiness', 'GetDaysOffByEAnnualLeaveAsync',
      [data.employeeID, data.alYear, data.alYearMonth, data.isMonth, this.pageIndex, this.pageSize]).subscribe((res: any) => {
        if (res && res?.length > 0) {
          this.listDaysOff = this.listDaysOff.concat(res);
          this.pageIndex = this.pageIndex + 1;
        } else {
          this.scrolling = false;
        }
        this.popupLoading = false;
      });
  }
  onScrollList(ele: HTMLDivElement) {
    var totalScroll = ele.clientHeight + ele.scrollTop;
    if (this.scrolling && (totalScroll == ele.scrollHeight)) {
      this.onShowDaysOff(this.currentItem);
    }
  }
  resetPage() {
    this.pageIndex = 0;
    this.pageSize = 5;
    this.listDaysOff = [];
    this.scrolling = true;
  }
  openAnnualLeaveMonthPopup(data: any) {
    let popupData = {
      funcID: this.funcID,
      headerText: this.monthHeaderText,
      data: data,
      grvSetup: this.grvSetup ? this.grvSetup : null,
    }
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popup = this.callfc.openForm(PopupAnnualLeaveMonthComponent,
      this.monthHeaderText,
      800,
      600,
      this.funcID,
      popupData,
      null,
      option);

    popup.closed.subscribe(e => {
    })
  }
}
