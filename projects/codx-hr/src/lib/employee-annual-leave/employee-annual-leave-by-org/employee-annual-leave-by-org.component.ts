import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiHttpService, CacheService, CodxGridviewV2Component, ViewsComponent } from 'codx-core';

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

  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('colEmployeeHeaderHRTAL01') colEmployeeHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colALPreYearHeaderHRTAL01') colALPreYearHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colALThisYearHeaderHRTAL01') colALThisYearHeaderHRTAL01: TemplateRef<any>;
  @ViewChild('colSeniorityHeaderHRTAL01') colSeniorityHeaderHRTAL01: TemplateRef<any>;

  @ViewChild('colEmployeeHRTAL01') colEmployeeHRTAL01: TemplateRef<any>;
  @ViewChild('colALPreYearHRTAL01') colALPreYearHRTAL01: TemplateRef<any>;
  @ViewChild('colALThisYearHRTAL01') colALThisYearHRTAL01: TemplateRef<any>;
  @ViewChild('colSeniorityHRTAL01') colSeniorityHRTAL01: TemplateRef<any>;

  @ViewChild('colEmployeeHeaderHRTAL02') colEmployeeHeaderHRTAL02: TemplateRef<any>;
  @ViewChild('colALYearMonthHeaderHRTAL02') colALYearMonthHeaderHRTAL02: TemplateRef<any>;
  @ViewChild('colALPreYearHeaderHRTAL02') colALPreYearHeaderHRTAL02: TemplateRef<any>;
  @ViewChild('colRealALPreYearHeaderHRTAL02') colRealALPreYearHeaderHRTAL02: TemplateRef<any>;
  @ViewChild('colDaysOffHeaderHRTAL02') colDaysOffHeaderHRTAL02: TemplateRef<any>;

  @ViewChild('colEmployeeHRTAL02') colEmployeeHRTAL02: TemplateRef<any>;
  @ViewChild('colALYearMonthHRTAL02') colALYearMonthHRTAL02: TemplateRef<any>;
  @ViewChild('colALPreYearHRTAL02') colALPreYearHRTAL02: TemplateRef<any>;
  @ViewChild('colRealALPreYearHRTAL02') colRealALPreYearHRTAL02: TemplateRef<any>;
  @ViewChild('colDaysOffHRTAL02') colDaysOffHRTAL02: TemplateRef<any>;

  service = 'HR';
  entityName = 'HR_EAnnualLeave';
  assemblyName = 'ERM.Business.HR';
  className = 'EAnnualLeavesBusiness';
  method = 'GetListEmployeeAnnualLeaveGrvV2Async';
  idField = 'recID';
  predicates = '@0.Contains(EmployeeID)';

  pageIndex = 0;
  pageSize = 5;
  listDaysOff: any = [];
  currentItem: any;
  scrolling: boolean = true;

  columnsGrid: any;

  popupLoading: boolean = false;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private routerActive: ActivatedRoute,
    private detectorRef: ChangeDetectorRef
  ) {
    this.routerActive.params.subscribe((params: Params) => {
      this.funcID = params['funcID'];
      this.initGridColumn();
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
    this.orgUnitID = changes.orgUnitID.currentValue;
    let ins = setInterval(() => {
      if (this.grid) {
        // this.grid.dataService.rowCount = 0;
        // this.grid.dataService.data = [];
        clearInterval(ins);
        this.grid.refresh();
      }
    }, 500);

    this.detectorRef.detectChanges();
  }
  initGridColumn() {
    switch (this.funcID) {
      case 'HRTAL01':
        this.columnsGrid = [
          {
            headerTemplate: this.colEmployeeHeaderHRTAL01,
            template: this.colEmployeeHRTAL01,
            width: '200',
          },
          {
            headerTemplate: this.colALPreYearHeaderHRTAL01,
            template: this.colALPreYearHRTAL01,
            width: '100',
          },
          {
            headerTemplate: this.colALThisYearHeaderHRTAL01,
            template: this.colALThisYearHRTAL01,
            width: '100',
          },
          {
            headerTemplate: this.colSeniorityHeaderHRTAL01,
            template: this.colSeniorityHRTAL01,
            width: '150',
          },
        ]
        break;
      case 'HRTAL02':
        this.columnsGrid = [
          {
            headerTemplate: this.colEmployeeHeaderHRTAL02,
            template: this.colEmployeeHRTAL02,
            width: '150',
          },
          {
            headerTemplate: this.colALYearMonthHeaderHRTAL02,
            template: this.colALYearMonthHRTAL02,
            width: '50',
          },
          {
            headerTemplate: this.colALPreYearHeaderHRTAL02,
            template: this.colALPreYearHRTAL02,
            width: '100',
          },
          {
            headerTemplate: this.colRealALPreYearHeaderHRTAL02,
            template: this.colRealALPreYearHRTAL02,
            width: '100',
          },
          {
            headerTemplate: this.colDaysOffHeaderHRTAL02,
            template: this.colDaysOffHRTAL02,
            width: '150',
          },
        ]
        break
    }

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
    if (data) {
      if (data?.recID != this.currentItem?.recID) {
        this.resetPage();
        this.currentItem = data;
      }
    }
    if (this.listDaysOff?.length <= 0)
      this.popupLoading = true;
    // var item = this.grid.dataSource.findIndex(x => x.recID == data.recID);
    // var item2 = this.grid.dataService.data.findIndex(x => x.recID == data.recID);

    this.api.execSv('HR', 'ERM.Business.HR', 'EAnnualLeavesBusiness', 'GetDaysOffByEAnnualLeaveAsync',
      [data.employeeID, data.alYear, data.alYearMonth, data.isMonth, this.pageIndex, this.pageSize]).subscribe((res: any) => {
        if (res && res?.length > 0) {
          // this.grid.dataSource[item].listDaysOff = res;
          // this.grid.dataService.data[item].listDaysOff = res;
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

}
