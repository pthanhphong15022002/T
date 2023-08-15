import { take, filter } from 'rxjs';
import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, NotificationsService, DialogData, DialogRef, AuthStore, CodxFormComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { DateTime } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-popup-calculate-annual-leave',
  templateUrl: './popup-calculate-annual-leave.component.html',
  styleUrls: ['./popup-calculate-annual-leave.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupCalculateAnnualLeaveComponent implements OnInit {
  data: any;
  dialogRef: any;
  funcID: any;
  headerText: string = "";
  employee: any;
  value: string = "";
  @Input() view: any;

  @ViewChild('form') form: CodxFormComponent;

  inputData: CalculateInputData = {
    alYear: null,
    employeeID: [],
    alObjectID: [],
    orgUnitID: [],
    alMonth: null,
    calculateALBy: '1',
    isExcept: false,
  }

  btnCancel: string = 'Hủy';
  btnCalculate: string = 'Tính';
  formModel: any;
  formGroup: any;
  grvSetup: any;

  employeeList: any = [];
  empIDList: string = '';

  orgUnitList: any = [];
  orgUnitIDList: string = '';

  alObjectList: any = [];
  alObjectIDList: string = '';

  inMonthValue: any = new Date().getMonth() + '/'+ new Date().getFullYear();
  inYearValue: any =  new Date();
  constructor(
    // private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dt?.data;
    this.headerText = this.data?.headerText;
    this.btnCalculate = this.data?.btnCalculate;
    this.btnCancel = this.data?.btnCancel;
    this.grvSetup = this.data?.grvSetup;
    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    this.funcID = this.data.funcID
  }

  ngOnInit() {
    this.inputData.alYear = this.inYearValue;
    this.inputData.alMonth = this.inMonthValue;
  }
  valueChange(event: any) {
    switch (event.field) {
      case 'employeeID':
        if (event.data?.dataSelected?.length > 0 && event.data.value[0]) {
          this.empIDList = event.data?.value.join(';'); //required input is string with ; between each value
          this.employeeList = event.data?.dataSelected.map((item) => ({
            employeeID: item.id,
            employeeName: item.text
          }));
          this.inputData[event.field] = event.data?.value;
        } else {
          this.employeeList = null;
          this.empIDList = '';
          this.inputData[event.field] = null;
        };
        break;
      case 'orgUnitID':
        if (event.data?.dataSelected?.length > 0 && event.data.value[0]) {
          this.orgUnitIDList = event.data?.value.join(';'); //required input is string with ; between each value
          this.orgUnitList = event.data?.dataSelected.map((item) => ({
            orgUnitID: item.id,
            orgUnitName: item.text
          }));
          this.inputData[event.field] = event.data?.value;
        } else {
          this.orgUnitList = null;
          this.orgUnitIDList = '';
          this.inputData[event.field] = null;
        };
        break;
      case 'alObjectID':
        if (event.data?.dataSelected?.length > 0 && event.data.value[0]) {
          this.alObjectIDList = event.data?.value.join(';'); //required input is string with ; between each value
          this.alObjectList = event.data?.dataSelected.map((item) => ({
            alObjectID: item.id,
            alObjectName: item.text
          }));
          this.inputData[event.field] = event.data?.value;
        } else {
          this.alObjectList = null;
          this.alObjectIDList = '';
          this.inputData[event.field] = null;
        };
        break;
      case 'calculateALBy':
        this.inputData[event.field] = event.data.value | event.data;
        break;
      case 'alYear':
        this.inputData[event.field] = event.data.value | event.data;
        break;
      case 'isExcept':
        this.inputData[event.field] = event.data.value | event.data;
        break;
      case 'inMonth':
        this.inputData[event.field] = event.data.value | event.data;
        break;
    }
  }
  deleteItem(data: any, fieldName: string){
    switch (fieldName){ 
      case 'alObjectID':
        this.alObjectList = this.alObjectList.filter(x => x.alObjectID !== data.alObjectID);
        this.alObjectIDList = this.alObjectList.map(x => x.alObjectID).join(';');
        break;
      case 'orgUnitID':
        this.orgUnitList = this.orgUnitList.filter(x => x.orgUnitID !== data.orgUnitID);
        this.orgUnitIDList = this.orgUnitList.map(x => x.orgUnitID).join(';');
        break;
    }
  }
  yearChange(data: boolean){
    if(data) {
      this.inYearValue ++;
    }else{
      this.inYearValue --;
    }
    this.inputData.alYear = this.inYearValue;
  }
  yearSelect(data: any){
    if(data?.fromDate != null){
      this.inYearValue = data.fromDate.getFullYear();
      this.inputData.alYear = this.inYearValue;
    }else{
      this.inYearValue = null;
      this.inputData.alYear = null;
    }
  }
  monthSelect(data: any){
    if(data?.toDate){
      this.inputData.alMonth = data?.toDate;
    }else{
      this.inputData.alMonth;
    }
  }
  confirm() {
    this.hrService.getEmployeeListByPopupCalculateAnnualLeaveAsync(this.inputData.alYear, this.inputData.alObjectID,
      this.inputData.orgUnitID, this.inputData.employeeID, this.inputData.calculateALBy, this.inputData.alMonth)
      .subscribe(res => {
        //this.dialogRef.close();
      })
  }
  cancel() {
    this.dialogRef.close();
  }
}
export class CalculateInputData {
  alYear: any;
  employeeID: any;
  alObjectID: any;
  orgUnitID: any;
  alMonth: any;
  calculateALBy: any;
  isExcept: boolean = false;
}

