import { Component, ElementRef, Input, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef } from 'codx-core';
import { elementAt } from 'rxjs';

@Component({
  selector: 'lib-popup-annual-leave-month',
  templateUrl: './popup-annual-leave-month.component.html',
  styleUrls: ['./popup-annual-leave-month.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAnnualLeaveMonthComponent implements OnInit, AfterViewInit {

  title: string = '';
  data: any;
  grvSetup: any[] = [];
  dialogRef: DialogRef;

  columnsGrid: any[] = [];

  @ViewChild('form') form: CodxFormComponent;

  @ViewChild('colALYearMonthHeader') colALYearMonthHeader: TemplateRef<any>;
  @ViewChild('colALPreYearHeader') colALPreYearHeader: TemplateRef<any>;
  @ViewChild('colRealALPreYearHeader') colRealALPreYearHeader: TemplateRef<any>;

  @ViewChild('colALYearMonth') colALYearMonth: TemplateRef<any>;
  @ViewChild('colALPreYear') colALPreYear: TemplateRef<any>;
  @ViewChild('colRealALPreYear') colRealALPreYear: TemplateRef<any>;

  
  service = 'HR';
  entityName = 'HR_EAnnualLeave';
  assemblyName = 'ERM.Business.HR';
  className = 'EAnnualLeavesBusiness_Old';
  method = 'GetListEmployeeAnnualLeaveMonthGrvV2Async';
  idField = 'recID';
  predicates = '@0 = EmployeeID && @1 = ALYear && ALYear != ALYearMonth';
  dataValues = '';
  constructor(private elRef: ElementRef,
    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef) {
    this.dialogRef = dialogRef;
    this.data = dt?.data?.data;
    this.title = dt?.data?.headerText;
    this.grvSetup = dt?.data?.grvSetup;
    this.dataValues = this.data?.employeeID + ';' + this.data?.alYear;
  }
  ngOnInit() {

  }
  ngAfterViewInit() {
    this.columnsGrid = [
      {
        headerTemplate: this.colALYearMonthHeader,
        template: this.colALYearMonth,
        // width: '200',
      },
      {
        headerTemplate: this.colALPreYearHeader,
        template: this.colALPreYear,
        // width: '200',
      },
      {
        headerTemplate: this.colRealALPreYearHeader,
        template: this.colRealALPreYear,
        // width: '200',
      }];
  }
}
