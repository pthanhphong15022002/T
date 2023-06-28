import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ViewsComponent, FormModel, CodxGridviewV2Component, ApiHttpService, CacheService, CallFuncService } from 'codx-core';

@Component({
  selector: 'lib-org-emp-contact-detail',
  templateUrl: './org-emp-contact-detail.component.html',
  styleUrls: ['./org-emp-contact-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrgEmpContactDetailComponent {
  console = console;
  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel = null;
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
    private cache: CacheService,) { }

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
    let ins = setInterval(() => {
      if (this.grid) {
        clearInterval(ins);
        this.orgUnitID = changes.orgUnitID.currentValue;
        this.grid.refresh();
      }
    }, 200);

  }
}
