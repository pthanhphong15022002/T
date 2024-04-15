
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import {
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { CalendarView } from '@syncfusion/ej2-angular-calendars';
import { DateTime } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-popup-edayoffs',
  templateUrl: './popup-edayoffs.component.html',
  styleUrls: ['./popup-edayoffs.component.css'],
})
export class PopupEdayoffsComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  lstPregnantType;
  dayoffObj: any;
  showInfoDayoffType = false;
  idField = 'RecID';
  successFlag = false;
  isnormalPregnant = false;
  isNotNormalPregnant = false;
  actionType: string;
  employId: string;
  headerText: string;
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  pregnancyFromVal;
  @ViewChild('form') form: CodxFormComponent;
  empObj: any;
  disabledInput = false;
  isPortal: boolean;
  allowToViewEmSelector: boolean = false;

  knowType = {
    type1: ['N20', 'N22', 'N23', 'N24', 'N25', 'N26', 'N35'],
    type2: ['N21'],
    type3: ['N31'],
    type4: ['N33'],
    type5: ['N34'],
  };
  groupKowTypeView: any;

  fromListView: boolean = false;
  funcID:string;
  grdViewSetUp:any;
  arrFieldRequired:any[];
  user:any;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private auth:AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() dialogData: DialogData
  ) 
  {
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.user = auth.get();
    if (dialogData && dialogData?.data) 
    {
      this.headerText = dialogData.data.headerText;
      this.funcID = dialogData.data.funcID;
      this.fromListView = dialogData.data.fromListView;
      this.actionType = dialogData.data.actionType;
      this.isPortal = dialogData.data.isPortal;
      if (this.actionType == 'view') this.disabledInput = true;
      if(dialogData.data.dayoffObj) 
      {
        this.dayoffObj = JSON.parse(JSON.stringify(dialogData.data.dayoffObj));
      }
      if(dialogData.data.actionType === 'add') this.dayoffObj.kowID = '';

      if(this.dayoffObj && this.dayoffObj?.employeeID && this.fromListView) 
        this.employId = this.dayoffObj.employeeID;
      else 
        this.employId = dialogData.data.employeeID;

      if (this.dayoffObj) 
        this.pregnancyFromVal = this.dayoffObj.pregnancyFrom;

      if (this.dayoffObj && this.dayoffObj?.emp && this.fromListView) 
        this.empObj = this.dayoffObj?.emp;
      else 
        this.empObj = dialogData?.data?.empObj || dialogData?.data;
    } 
  }

  ngOnInit(): void {
    this.initForm();
    if (this.employId) 
      this.getEmployeeInfoById(this.employId, 'employeeID');
  }

  initForm() {
    if(this.empObj)
    {
      let orgUnitID = this.empObj.orgUnitID ?? this.empObj.emp?.orgUnitID;
      this.hrSevice.getOrgUnitID(orgUnitID)
      .subscribe((res) => {
        if (res) 
        {
          this.empObj.orgUnitName = res.orgUnitName;
        }
      });
    }
    // get gridViewSetup
    this.cache.gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
    .subscribe((grv) => {
      if(grv)
      {
        this.grdViewSetUp = grv;
        let arrField = Object.values(grv).filter((x: any) => x.isRequire);
        if (Array.isArray(arrField))
          this.arrFieldRequired = arrField.map((x: any) => x.fieldName);

        if(grv.NewChildBirthType && grv.NewChildBirthType?.referedValue)
        {
          this.cache.valueList(grv.NewChildBirthType.referedValue)
          .subscribe((vll:any) => {
            if(vll && vll?.datas && vll?.datas?.length > 0)
            {
              this.lstPregnantType = vll.datas;
              if (this.dayoffObj) 
              {
                if(this.dayoffObj.newChildBirthType == this.lstPregnantType[0].value) 
                  this.isnormalPregnant = true;
                else if (this.dayoffObj.newChildBirthType == this.lstPregnantType[1].value) 
                  this.isNotNormalPregnant = true;
              }
            }
          });
        }
      }
    });

    if (this.actionType == 'add') 
    {
      this.hrSevice.getDataDefault(this.formModel.funcID,this.formModel.entityName,this.idField)
      .subscribe((res: any) => {
        if (res) 
        {
          this.dayoffObj = res.data;
          this.dayoffObj.beginDate = new Date(); 
          this.dayoffObj.endDate = new Date();
          this.dayoffObj.employeeID = this.employId;
          this.dt.detectChanges();
        }
      });
    } 
  }

  UpdateFromDate(e) {
    this.pregnancyFromVal = e;
  }

  // save form
  onSaveForm() {
    if (this.actionType === 'copy' || this.actionType === 'add') delete this.dayoffObj.recID;
    this.dayoffObj.pregnancyFrom = this.pregnancyFromVal;
    this.dayoffObj.employeeID = this.employId;
    this.dayoffObj.createdOn = new Date();
    this.dayoffObj.createdBy = this.user.userID;
    if(this.validate())
    {
      if (this.actionType === 'add' || this.actionType === 'copy') 
      {
        this.hrSevice.AddEmployeeDayOffInfo(this.dayoffObj).subscribe((res:any) => {
          if (res) 
          {
            this.dayoffObj.recID = res.recID;
            this.notify.notifyCode('SYS006');
            res.emp = this.empObj;
            this.successFlag = true;
            this.dialog && this.dialog.close(res);
          }
        });
      } 
      else 
      {
        this.hrSevice.UpdateEmployeeDayOffInfo(this.dayoffObj).subscribe((res:any) => {
          if (res) 
          {
            this.successFlag = true;
            this.notify.notifyCode('SYS007');
            res.emp = this.empObj;
            this.dialog && this.dialog.close(res);
          }
        });
      }
    }
    
  }

  calTotalDayoff(evt) {
    this.dayoffObj.totalDaysOff = evt.data - this.dayoffObj.totalSubDays;
    this.form.formGroup.patchValue({ totalDaysOff: this.dayoffObj.totalDaysOff });
  }

  HandlePregnantTypeChange(e, pregnantType) {
    if (e.component.checked == true) {
      if (pregnantType.value == '1') {
        this.isnormalPregnant = true;
        this.isNotNormalPregnant = false;
      } else {
        this.isnormalPregnant = false;
        this.isNotNormalPregnant = true;
      }
    } else if (e.component.checked == false) {
      if (pregnantType.value == '1') {
        this.isnormalPregnant = false;
      } else if (pregnantType.value == '2') {
        this.isNotNormalPregnant = false;
      }
    }
  }

  HandleTotalDaysVal(periodType: string) {
    let beginDate = new Date(this.dayoffObj.beginDate);
    let endDate = new Date(this.dayoffObj.endDate);
    let dif = endDate.getTime() - beginDate.getTime();
    if (periodType == '1') {
      this.dayoffObj.totalDays = dif / (1000 * 60 * 60 * 24) + 1;
    }
    if (
      (periodType == '2' || periodType == '3') &&
      this.dayoffObj.beginDate == this.dayoffObj.endDate
    ) {
      this.dayoffObj.totalDays = 0.5;
    }

    if (
      this.dayoffObj.endDate > this.dayoffObj.beginDate &&
      (periodType == '2' || periodType == '3')
    ) {
      this.dayoffObj.endDate = this.dayoffObj.beginDate;
      this.form.formGroup.patchValue({ endDate: this.dayoffObj.beginDate });
      this.dayoffObj.totalDays = 0.5;
    }

    this.form.formGroup.patchValue({
      totalDays:
        this.dayoffObj.endDate < this.dayoffObj.beginDate
          ? ''
          : this.dayoffObj.totalDays,
    });

    this.form.formGroup.patchValue({
      totalDaysOff:
        this.dayoffObj.endDate < this.dayoffObj.beginDate
          ? ''
          : this.dayoffObj.totalDays,
    });
  }

  // value change
  valueChange(event:any){
    let field =  event.field;
    let value = event.data;
    switch(field)
    {
      case "beginDate":
        this.dayoffObj["beginDate"] = new Date(value.getFullYear(),value.getMonth(),value.getDate(),new Date().getHours(),new Date().getMinutes());
        break;
      case "endDate":
        this.dayoffObj["endDate"] = new Date(value.getFullYear(),value.getMonth(),value.getDate(),new Date().getHours(),new Date().getMinutes()); 
        break;
      case "periodType":
        this.dayoffObj["periodType"] = value;
        break;
      case "kowID":
        this.dayoffObj["kowID"] = value;
        break;
    }
    if (this.dayoffObj && this.dayoffObj?.kowID && this.dayoffObj?.endDate && this.dayoffObj?.beginDate && this.dayoffObj?.periodType) 
    {
      this.calculateDayOff(this.dayoffObj.beginDate,this.dayoffObj.endDate,this.dayoffObj.employeeID,this.dayoffObj.kowID,this.dayoffObj.periodType);
    }
  }

  // call HR_fnCalculateDayOff
  calculateDayOff(fromDate:Date,toDate:Date,employeeID:string,kowID:string,periodType:string){
    this.api.execSv("HR","HR","EDayOffsBusiness_Old","CalculateDayOffAsync",[fromDate,toDate,employeeID,kowID,periodType])
    .subscribe((res:any) => {
      this.dayoffObj["totalDaysOff"] = res ?? 0;
      this.form.formGroup.patchValue({totalDaysOff: this.dayoffObj["totalDaysOff"]});
      this.dt.detectChanges();
    });
  }

  dateCompare(beginDate, endDate) {
    if (beginDate && endDate) {
      let date1 = new Date(beginDate);
      let date2 = new Date(endDate);
      return date1 <= date2;
    }
    return false;
  }

  allowToViewEmp() {
    //check if show emp info or not
    switch (this.actionType) {
      case 'edit':
        // if (this.fromListView) return true;
        // else return false;
        break;
      case 'add':
        break;
      case 'copy':
        break;
    }
  }
  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        if (fieldName === 'employeeID') {
          this.empObj = emp[0][0];

          this.hrSevice
            .getOrgUnitID(this.empObj?.orgUnitID ?? this.empObj?.emp?.orgUnitID)
            .subscribe((res) => {
              this.empObj.orgUnitName = res.orgUnitName;
            });
        } else if (fieldName === 'signerID') {
          this.dayoffObj.signer = emp[0][0]?.employeeName;
          if (emp[0][0]?.positionID) {
            this.hrSevice
              .getPositionByID(emp[0][0]?.positionID)
              .subscribe((res) => {
                if (res) {
                  this.dayoffObj.signerPosition = res.positionName;
                  this.form.formGroup.patchValue({
                    //signer: this.dayoffObj.signer,
                    signerPosition: this.dayoffObj.signerPosition,
                  });
                  this.dt.detectChanges();
                }
              });
          } else {
            this.dayoffObj.signerPosition = null;
            this.form.formGroup.patchValue({
              //signer: this.dayoffObj.signer,
              signerPosition: this.dayoffObj.signerPosition,
            });
          }
        }
      }
      this.dt.detectChanges();
    });
  }
  handleSelectEmp(evt) {
    switch (evt?.field) {
      case 'employeeID': //check if employee changed
        if (evt?.data && evt?.data.length > 0) {
          this.employId = evt?.data;
          this.getEmployeeInfoById(this.employId, evt?.field);
        } else {
          delete this.employId;
          delete this.empObj;
          this.form.formGroup.patchValue({
            employeeID: this.dayoffObj.employeeID,
          });
        }
        break;
      case 'signerID': // check if signer changed
        if (evt?.data && evt?.data.length > 0) {
          this.getEmployeeInfoById(evt?.data, evt?.field);
        } else {
          delete this.dayoffObj?.signerID;
          // delete this.awardObj.signer;
          // delete this.awardObj?.signerPosition;
          this.form.formGroup.patchValue({
            signerID: null,
            // signer: null,
            // signerPosition: null,
          });
        }
        break;
    }
  }

  kowIDValuechange() {
    this.checkViewKowTyeGroup();
  }

  getGroupKowTypeView() {
    this.groupKowTypeView = {
      groupA: {
        value: this.knowType.type1
          .concat(this.knowType.type2)
          .concat(this.knowType.type4)
          .concat(this.knowType.type5),
        isShow: false,
        field: ['siLeaveNo', 'hospitalLine'],
      },
      groupB: {
        value: this.knowType.type2,
        isShow: false,
        field: ['childID', 'childHICardNo'],
      },
      groupC: {
        value: this.knowType.type4.concat(this.knowType.type5),
        isShow: false,
        field: ['pregnancyFrom', 'pregnancyWeeks'],
      },
      groupD: {
        value: this.knowType.type3,
        isShow: false,
        field: [
          'newChildBirthDate',
          'newChildNum',
          'isNewChildUnder32W',
          'newChildBirthType',
          'wifeID',
          'wifeIDCardNo',
          'wifeSINo',
        ],
      },
    };
  }
  
  checkViewKowTyeGroup() {
    if (this.dayoffObj['kowID']) 
    {
      this.showInfoDayoffType = false;
      for (let i in this.groupKowTypeView) 
      {
        this.groupKowTypeView[i].isShow = this.groupKowTypeView[i].value.includes(this.dayoffObj['kowID']);

        if (this.groupKowTypeView[i].value.includes(this.dayoffObj['kowID']) == true) 
        {
          this.showInfoDayoffType = true;
        }
      }
    } 
    else this.getGroupKowTypeView();
  }



  // check validate submit form
  validate():boolean{
    if(!this.dayoffObj) return false;
    if (this.arrFieldRequired && this.arrFieldRequired.length > 0) 
    {
      for (let index = 0; index < this.arrFieldRequired.length; index++) {
        let field = this.arrFieldRequired[index];
        if(!this.dayoffObj[Util.camelize(field)]) 
        {
          this.notify.notifyCode('SYS009', 0, this.grdViewSetUp[field].headerText);
          return false;
        }
      }
    }
    if(this.dayoffObj.beginDate > this.dayoffObj.endDate)
    {
      this.cache.message("HR003")
      .subscribe((mssg:any) => {
        if(mssg)
        {
          let message = mssg.defaultName ?? mssg.customName;
          message = Util.stringFormat(message,this.grdViewSetUp["EndDate"].headerText,this.grdViewSetUp["BeginDate"].headerText);
          this.notify.notify(message);
        }
      });
      return false;
    }
    return true;
  }
}
