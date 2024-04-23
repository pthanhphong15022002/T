import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
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
import { Subject, takeUntil } from 'rxjs';
import { HR_Employees } from '../../codx-hr-common/model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-employees',
  templateUrl: './popup-add-employees.component.html',
  styleUrls: ['./popup-add-employees.component.css'],
})
export class PopupAddEmployeesComponent implements OnInit, OnDestroy {

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
  functionName: string = '';
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
    {
      icon: 'icon-person',
      text: 'Thông tin nhân viên',
      name: 'tabInfoPersonal',
    },
    {
      icon: 'icon-payment',
      text: 'Lý lịch cá nhân',
      name: 'tabInfoEmploy',
    },
    // Them tab o day
    {
      icon: 'icon-family_restroom',
      text: 'Thân nhân',
      name: 'tab1',
    },
    {
      icon: 'icon-business_center',
      text: 'Hộ chiếu',
      name: 'tab2',
    },
    {
      icon: 'icon-receipt_long',
      text: 'Hợp đồng lao đông',
      name: 'tab3',
    },
    {
      icon: 'icon-attach_money',
      text: 'Lương cơ bản',
      name: 'tab4',
    },
    {
      icon: 'icon-card_travel',
      text: 'Lương chức danh công việc',
      name: 'tab5',
    },
    {
      icon: 'icon-card_giftcard',
      text: 'Phụ cấp',
      name: 'tab6',
    },
    {
      icon: 'icon-book',
      text: 'Thông tin văn bằng',
      name: 'tab7',
    },
  ];
  @ViewChild('form') form: LayoutAddComponent;
  destroy$ = new Subject<void>();
  function:any;
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
    if(this.dialogData)
    {
      this.isAdd = this.dialogData.isAdd;
      this.action = this.dialogData.action;
      this.funcID = this.dialogData.funcID;
      this.cache.functionList(this.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((func: any) => {
        if (func)
        {
          this.function = func;
          this.cache.gridViewSetup(func.formName, func.gridViewName)
          .pipe(takeUntil(this.destroy$))
          .subscribe((grd: any) => {
            if (grd) {
              this.grvSetup = grd;
              let arrField = Object.values(grd).filter((x: any) => x.isRequire);
              if(arrField)
                this.arrFieldRequire = arrField.map((x: any) => x.fieldName);
            }
          });
        }
      });
      if(this.dialogData.employee)
        this.employee = JSON.parse(JSON.stringify(this.dialogData.employee));
    }

  }

  ngOnInit(): void {
    // this.adService.getListCompanySettings()
    // .subscribe((res) => {
    //   if (res) {
    //     this.isCorporation = res.isCorporation; // check disable field DivisionID
    //   }
    // });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        if(field === 'EmployeeID') return;

        let key = Util.camelize(field);
        if (!this.employee[key]) {
          arrFieldUnValid += this.grvSetup[field]['headerText'] + ';';
        }
      });
    }
    if (arrFieldUnValid) {
      this.notifiSV.notifyCode(this.mssgCode, 0, arrFieldUnValid);
    } else {
      if (this.isAdd) {
        this.addEmployeeAsync(this.employee, this.funcID);
      } else {
        if (
          !this.employee["updateColumn"].includes('DepartmentID')
        ) {
          this.employee["updateColumn"] += 'DepartmentID;';
          this.employee["updateColumns"] += 'DepartmentID;';
        }
        if (
          !this.employee["updateColumn"].includes('DivisionID')
        ) {
          this.employee["updateColumn"] += 'DivisionID;';
          this.employee["updateColumns"] += 'DivisionID;';
        }
        if (
          !this.employee["updateColumn"].includes('CompanyID')
        ) {
          this.employee["updateColumn"] += 'CompanyID;';
          this.employee["updateColumns"] += 'CompanyID;';
        }
        this.updateEmployeeAsync(this.employee);
      }
    }
  }
  // update employee
  updateEmployeeAsync(employee: any) {
    if (employee) {
      this.api
        .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness_Old', 'UpdateAsync', [
          employee,
          this.funcID,
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          let _mssgCode = res ? 'SYS007' : 'SYS021';
          this.notifiSV.notifyCode(_mssgCode);
          this.dialogRef.close(res? res : false);
        });
    }
  }
  // add employee
  addEmployeeAsync(employee: any, funcID: string) {
    this.api
      .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness_Old', 'SaveAsync', [
        employee,
        funcID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let _mssgCode = res ? 'SYS006' : 'SYS023';
        this.notifiSV.notifyCode(_mssgCode);
        this.dialogRef.close(res);
      });
  }
  //value change
  dataChange(e: any) {
    if (e) {
      let field = Util.camelize(e.field);
      let data = e.data;
      this.employee[field] = data;
      if (field == 'positionID') {
        let itemSelected = e.component?.itemsSelected[0];
        if (itemSelected) {
          if (itemSelected['OrgUnitID']) {
            let orgUnitID = itemSelected['OrgUnitID'];
            if (orgUnitID != this.employee['orgUnitID']) {
              this.form.formGroup.patchValue({ orgUnitID: orgUnitID });
              this.employee['orgUnitID'] = orgUnitID;
            }
          }
          if (itemSelected['DepartmentID']) {
            let departmentID = itemSelected['DepartmentID'];
            if (departmentID != this.employee['departmentID']) {
              this.form.formGroup.patchValue({ departmentID: departmentID });
              this.employee['departmentID'] = departmentID;
            }
          }
          if (itemSelected['DivisionID']) {
            let divisionID = itemSelected['DivisionID'];
            if (divisionID != this.employee['divisionID']) {
              this.form.formGroup.patchValue({ divisionID: divisionID });
              this.employee['divisionID'] = divisionID;
            }
          }
          if (itemSelected['CompanyID']) {
            let companyID = itemSelected['CompanyID'];
            if (companyID != this.employee['companyID']) {
              this.form.formGroup.patchValue({ companyID: companyID });
              this.employee['companyID'] = companyID;
            }
          }
        }
      }
    }
  }
}
