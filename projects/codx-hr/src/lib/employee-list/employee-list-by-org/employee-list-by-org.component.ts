import { ChangeDetectorRef, Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormModel, CodxGridviewV2Component, CacheService, ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-employee-list-by-org',
  templateUrl: './employee-list-by-org.component.html',
  styleUrls: ['./employee-list-by-org.component.scss']
})
export class EmployeeListByOrgComponent {
  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel = null;
  @Input() showManager: boolean = false;
  employeeManager: any = null;
  totalEmployee: number = 0;
  columnsGrid;
  grvSetup: any = {};
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('templateName') templateName: TemplateRef<any>;
  @ViewChild('templateBirthday') templateBirthday: TemplateRef<any>;
  @ViewChild('templatePhone') templatePhone: TemplateRef<any>;
  @ViewChild('templateEmail') templateEmail: TemplateRef<any>;
  @ViewChild('templateJoinedOn') templateJoinedOn: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateMoreFC') templateMoreFC: TemplateRef<any>;


  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef) { }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    if (!this.columnsGrid) {
      this.cache
        .gridViewSetup(
          this.formModel.formName,
          this.formModel.gridViewName
        )
        .subscribe((grd: any) => {
          if (grd) {
            this.grvSetup = grd;
            this.columnsGrid = [
              {
                headerText: grd['EmployeeName']['headerText'],
                field: 'EmployeeName',
                template: this.templateName,
                width: '200',
              },
              {
                headerText: grd['Birthday']['headerText'],
                field: 'Birthday',
                template: this.templateBirthday,
                width: '100',
              },
              {
                headerText: grd['Phone']['headerText'],
                field: 'Phone',
                template: this.templatePhone,
                width: '100',
              },
              {
                headerText: grd['Email']['headerText'],
                field: 'Email',
                template: this.templateEmail,
                width: '200',
              },
              {
                headerText: grd['JoinedOn']['headerText'],
                field: 'JoinedOn',
                template: this.templateJoinedOn,
                width: '140',
              },
              {
                headerText: grd['Status']['headerText'],
                field: 'Status',
                template: this.templateStatus,
                width: '140',
              },
            ];
          }
        });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.orgUnitID = changes.orgUnitID.currentValue;
    let ins = setInterval(() => {
      if (this.grid) {
        clearInterval(ins);
        this.grid.refresh();
      }
    }, 200);
    if(this.showManager) this.getManager(this.orgUnitID);
  }

  getManager(orgUnitID: string) {
    if (orgUnitID) {
      this.api.execSv('HR','ERM.Business.HR','EmployeesBusiness','GetOrgManager',[orgUnitID])
        .subscribe((res: any) => {
          if (res) {
            this.employeeManager = JSON.parse(JSON.stringify(res));
          } else {
            this.employeeManager = null;
          }
          this.dt.detectChanges();
        });
    }
  }

}
