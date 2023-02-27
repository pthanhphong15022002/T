import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  DialogData,
  DialogRef,
  LayoutAddComponent,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { HR_Employees } from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-employees',
  templateUrl: './popup-add-employees.component.html',
  styleUrls: ['./popup-add-employees.component.css'],
})
export class PopupAddEmployeesComponent implements OnInit {
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabInfoPersonal',
    },
    {
      icon: 'icon-person',
      text: 'Nhân viên',
      name: 'tabInfoEmploy',
    },
    // {
    //   icon: 'icon-receipt_long',
    //   text: 'Thông tin cá nhân',
    //   name: 'tabInfoPrivate',
    // },
    // {
    //   icon: 'icon-business_center',
    //   text: 'Pháp lý',
    //   name: 'tabInfoLaw',
    // },
  ];
  isCorporation = false;
  dialogRef: any;
  dialogData: any = null;
  employee: HR_Employees;
  isAdd: boolean = true;
  currentSection = 'InfoPersonal';
  user: any;
  action = '';
  funcID: string;
  isAfterRender = false;
  gridViewSetup: any;
  paramaterHR: any = null;
  grvSetup: any = {};
  arrFieldRequire: any[] = [];
  mssgCode: string = 'SYS009';
  functionName:string ="";
  @ViewChild('form') form: LayoutAddComponent;
  constructor(
    private auth: AuthService,
    private notifiSV: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private adService: CodxAdService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.user = this.auth.userValue;
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    debugger
    this.isAdd = this.dialogData.isAdd;
    this.action = this.dialogData.action;
    this.funcID = this.dialogData.funcID;
    this.employee = JSON.parse(JSON.stringify(this.dialogData.employee));
    this.getFunction(this.funcID);
    // this.adService.getListCompanySettings()
    // .subscribe((res) => {
    //   if (res) {
    //     this.isCorporation = res.isCorporation; // check disable field DivisionID
    //   }
    // });
  }
  //get function
  getFunction(functionID: string) {
    if (functionID) {
      this.cache.functionList(functionID).subscribe((func: any) => {
        if (func){
          this.functionName = func.description;
          this.getGridViewSetup(func.formName,func.gridViewName);
        }
      });
    }
  }
  // get grvsetup
  getGridViewSetup(formName: string,gridViewName:string) {
    if (formName && gridViewName) {
      this.cache
        .gridViewSetup(formName,gridViewName)
        .subscribe((grd: any) => {
          if (grd) {
            this.grvSetup = grd;
            let arrField = Object.values(grd).filter((x: any) => x.isRequire);
            if (arrField) {
              this.arrFieldRequire = arrField.map((x: any) => x.fieldName);
            }
          }
        });
    }
  }
  // set title popup
  setTile(form) {
    form.title = this.action;
    this.detectorRef.detectChanges();
  }

  // btn save
  OnSaveForm() {
    let arrFieldUnValid: string = '';
    if (this.arrFieldRequire.length > 0) {
      this.arrFieldRequire.forEach((field) => {
        let key = Util.camelize(field);
        if (!this.employee[key]) {
          arrFieldUnValid += this.grvSetup[field]['headerText'] + ';';
        }
      });
    }
    if (arrFieldUnValid) {
      this.notifiSV.notifyCode(this.mssgCode, 0, arrFieldUnValid);
    } else 
    {
      if (this.isAdd) 
      {
        this.addEmployeeAsync(this.employee);
      } 
      else {
        this.updateEmployeeAsync(this.employee);
      }
    }
  }
  // update employee
  updateEmployeeAsync(employee: any) {
    if (employee) {
      this.api
        .execSv("HR","ERM.Business.HR","EmployeesBusiness","UpdateAsync",[employee,this.funcID])
        .subscribe((res: any) => {
          if (res) 
          {
            this.notifiSV.notifyCode('SYS007');
          } 
          else 
          {
            this.notifiSV.notifyCode('SYS021');
          }
          this.dialogRef.close(res);
        });
    }
  }
  // add employee
  addEmployeeAsync(employee: any) {
    if (employee) {
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","SaveAsync",[employee])
      .subscribe((res:any) => {
        debugger
        if(res)
          this.notifiSV.notifyCode("SYS006");
        else
          this.notifiSV.notifyCode('SYS023');
        this.dialogRef.close(res);
      });
    }
  }
  //value change
  dataChange(e: any) {
    if (e){
      let field = Util.camelize(e.field);
      let data = e.data;
      this.employee[field] = data;
      if(field == "positionID"){
        debugger
        let itemSelected = e.component?.itemsSelected[0];
        if(itemSelected){
          if(itemSelected["OrgUnitID"])
          {
            let orgUnitID = itemSelected["OrgUnitID"];
            if(orgUnitID != this.employee["orgUnitID"])
            {
              this.form.formGroup.patchValue({"orgUnitID":orgUnitID});
              this.employee["orgUnitID"] = orgUnitID;
            }
          }
          if(itemSelected["DepartmentID"])
          {
            let departmentID = itemSelected["DepartmentID"];
            if(departmentID != this.employee["departmentID"])
            {
              this.form.formGroup.patchValue({"departmentID":departmentID});
              this.employee["departmentID"] = departmentID;
            }
          }
          if(itemSelected["DivisionID"])
          {
            let divisionID = itemSelected["DivisionID"];
            if(divisionID !=  this.employee["divisionID"]){
              this.form.formGroup.patchValue({"divisionID":divisionID});
              this.employee["divisionID"] = divisionID;
            }
          }
          if(itemSelected["CompanyID"])
          {
            let companyID = itemSelected["CompanyID"];
            if(companyID != this.employee["companyID"]){
              this.form.formGroup.patchValue({"companyID":companyID});
              this.employee["companyID"] = companyID;
            }
          }
        }
      }
    }
  }
}
