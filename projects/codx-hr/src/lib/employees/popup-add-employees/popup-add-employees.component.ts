import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { Observable, Subject } from 'rxjs';
import { HR_Employees } from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-employees',
  templateUrl: './popup-add-employees.component.html',
  styleUrls: ['./popup-add-employees.component.css']
})
export class PopupAddEmployeesComponent implements OnInit {
  title = '';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabInfoPersonal'
    },
    {
      icon: 'icon-person',
      text: 'Nhân viên',
      name: 'tabInfoEmploy'
    },
    {
      icon: 'icon-receipt_long',
      text: 'Thông tin cá nhân',
      name: 'tabInfoPrivate',
    },
    {
      icon: 'icon-business_center',
      text: 'Pháp lý',
      name: 'tabInfoLaw',
    },
  ];
  dialog: any;
  employee: any;
  readOnly = false;
  showAssignTo = false;
  isSaving: boolean = false;
  isNew: boolean = true;
  // dataBind: any = {};
  currentSection = "InfoPersonal";
  isDisable = false;
  user: any;
  formName = "";
  gridViewName = "";
  functionID: string;
  isAfterRender = false;
  gridViewSetup: any;
  action = '';
  data: any;
  titleAction = 'Thêm';

  constructor(
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,
  ) {
    this.action = dt.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.formName = this.dialog.formModel.formName;
    this.gridViewName = this.dialog.formModel.gridViewName;
    this.functionID = this.dialog.formModel.funcID;
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.employee = this.data;
  }

  ngOnInit(): void {
    this.initForm();
    this.cache.gridViewSetup('Employees', 'grvEmployees').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    });
    if (this.action === 'edit') {
      this.titleAction = 'Chỉnh sửa';
      this.isNew = false;
    }
    if (this.action === 'copy') {
      this.titleAction = 'Sao chép';
    }
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      if (this.action === 'add') {
        this.getAutonumber("HRT03", "HR_Employees", "EmployeeID").subscribe(key => {
          this.employee.employeeID = key;
        })
      }

    })
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.authStore.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == "owner") {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == "createdOn") {
                model[element.fieldName].push(new Date());
              }
              else if (element.fieldName == "stop") {
                model[element.fieldName].push(false);
              }
              else if (element.fieldName == "orgUnitID") {
                model[element.fieldName].push(user['buid']);
              }
              else if (element.dataType == "Decimal" || element.dataType == "Int") {
                model[element.fieldName].push(0);
              }
              else if (element.dataType == "Bool" || element.dataType == "Boolean")
                model[element.fieldName].push(false);
              else if (element.fieldName == "createdBy") {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }
            }
          }
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e;
    this.detectorRef.detectChanges();
    console.log(e);
  }

  beforeSave(op: any) {
    var data = [];
    op.methodName = 'UpdateAsync';
    op.className = 'EmployeesBusiness';

    if (this.action === 'add') {
      this.isNew = true;
    } else if (this.action === 'edit') {
      this.isNew = false;
    }
    data = [
      this.employee,
      this.isNew
    ];
    op.data = data;
    return true;
  }

  OnSaveForm() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        // if (res) {
        //   this.dialog.close(res);
        // }
        this.dialog.close(res)
      });
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (!Array.isArray(e.data)) {
        this.employee[field] = e.data;
      } else {
        this.employee[field] = e.data.join(';');
      }
      if(e.component && e.component?.itemsSelected){
        switch(field){
          case "positionID":
            this.getDataFromPositionID(e.component.itemsSelected);
            break;
          default:
            break;
        }
      }
    }
  }
  getDataFromPositionID(dataSelected:any){
    if(!dataSelected) return;
    dataSelected.map((e:any) => {
      console.log(e);
      this.employee["organizationID"] = e.OrgUnitID;
      this.employee["departmentID"] = e.DepartmentID;
      this.detectorRef.detectChanges();
    });
  }
  changeTime(data) {
    if (!data.field || !data.data) return;
    this.employee[data.field] = data.data?.fromDate;
  }

  buttonClick(e: any) {
    console.log(e);
  }
}
