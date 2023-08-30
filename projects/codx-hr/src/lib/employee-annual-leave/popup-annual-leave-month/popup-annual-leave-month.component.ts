import { Component, Input, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-annual-leave-month',
  templateUrl: './popup-annual-leave-month.component.html',
  styleUrls: ['./popup-annual-leave-month.component.css']
})
export class PopupAnnualLeaveMonthComponent implements OnInit {

  data: any;
  headerText: string = '';
  columnsGrid: any;
  grvSetup: any;
  dialogRef: any;
  funcID: string ='';

  service = 'HR';
  entityName = 'HR_EAnnualLeave';
  assemblyName = 'ERM.Business.HR';
  className = 'EAnnualLeavesBusiness';
  method = 'GetListEmployeeAnnualLeaveMonthGrvV2Async';
  idField = 'recID';
  predicates = '@0 = EmployeeID && @1 = ALYear && ALYear != ALYearMonth';


  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  @ViewChild('colALYearMonthHeader') colALYearMonthHeader: TemplateRef<any>;
  @ViewChild('colALPreYearHeader') colALPreYearHeader: TemplateRef<any>;
  @ViewChild('colRealALPreYearHeader') colRealALPreYearHeader: TemplateRef<any>;
  
  @ViewChild('colALYearMonth') colALYearMonth: TemplateRef<any>;
  @ViewChild('colALPreYear') colALPreYear: TemplateRef<any>;
  @ViewChild('colRealALPreYear') colRealALPreYear: TemplateRef<any>;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef) {
      this.data = dt?.data?.data;
      this.headerText = dt?.data?.headerText;
      this.dialogRef = dialogRef;
      this.funcID = this.data.funcID
  }

  ngOnInit(): void { 
  }
  ngAfterViewInit(): void { 
    this.columnsGrid = [
      {
        headerTemplate: this.colALYearMonthHeader,
        template: this.colALYearMonth,
        width: '100',
      },
      {
        headerTemplate: this.colALPreYearHeader,
        template: this.colALPreYear,
        width: '200',
      },
      {
        headerTemplate: this.colRealALPreYearHeader,
        template: this.colRealALPreYear,
        width: '200',
      },
    ]
  }
}
