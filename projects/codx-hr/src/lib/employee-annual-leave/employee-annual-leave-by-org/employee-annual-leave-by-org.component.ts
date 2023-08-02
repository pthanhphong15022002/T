import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiHttpService, CacheService, CodxGridviewV2Component, ViewsComponent } from 'codx-core';

@Component({
  selector: 'lib-employee-annual-leave-by-org',
  templateUrl: './employee-annual-leave-by-org.component.html',
  styleUrls: ['./employee-annual-leave-by-org.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeAnnualLeaveByOrgComponent implements OnInit, OnChanges {
  @Input() funcID: string = 'HRTAL01';
  @Input() grvSetup: any;
  @Input() orgUnitID: string = '';
  @Input() showRowNumber: boolean = false;
  @Input() formModel: any;
  @Input() rowHeight: number;
  @Input() view: ViewsComponent;

  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colALPreYearHeader') colALPreYearHeader: TemplateRef<any>;
  @ViewChild('colALThisYearHeader') colALThisYearHeader: TemplateRef<any>;
  @ViewChild('colSeniorityHeader') colSeniorityHeader: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colALPreYear') colALPreYear: TemplateRef<any>;
  @ViewChild('colALThisYear') colALThisYear: TemplateRef<any>;
  @ViewChild('colSeniority') colSeniority: TemplateRef<any>;

  service = 'HR';
  entityName = 'HR_EAnnualLeave';
  assemblyName = 'ERM.Business.HR';
  className = 'EAnnualLeavesBusiness';
  method = 'GetListEmployeeAnnualLeaveGrvV2Async';
  idField = 'recID';
  predicates = '';

  columnsGrid: any;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private routerActive: ActivatedRoute,
  ) {
    // this.routerActive.params.subscribe((params: Params) => {
    //   this.funcID = params['funcID'];
    // })
  }

  ngOnInit() { 
  }
  ngAfterViewInit() {
    this.initGridColumn();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.orgUnitID?.currentValue) {
      this.orgUnitID = changes.orgUnitID.currentValue;
      this.getEmpAnnualLeaveByOrgUnitID(this.orgUnitID);
    }
    if (changes?.funcID?.currentValue) {
      if (!this.grvSetup) {
        this.getFunction(this.funcID);
        //this.initGridColumn();
      }
    }
  }
  initGridColumn(){
    this.columnsGrid = [
      {
        headerTemplate: this.colEmployeeHeader,
        template: this.colEmployee,
        width: '200',
      },
      {
        headerTemplate: this.colALPreYearHeader,
        template: this.colALPreYear,
        width: '100',
      },
      {
        headerTemplate: this.colALThisYearHeader,
        template: this.colALThisYear,
        width: '100',
      },
      {
        headerTemplate: this.colSeniorityHeader,
        template: this.colSeniority,
        width: '150',
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
  getEmpAnnualLeaveByOrgUnitID(orgUnitID: string) {

  }

}
