import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
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
  dialogRef: any;
  dialogData: any = null  ;
  employee: HR_Employees;
  defaultEmployeeID:string = "";
  readOnly = false;
  showAssignTo = false;
  isSaving: boolean = false;
  isNew: boolean = true;
  currentSection = "InfoPersonal";
  user: any;
  formName = "";
  gridViewName = "";
  functionID: string;
  isAfterRender = false;
  gridViewSetup: any;
  action : "add" | "edit" | "copy" = "add";
  paramaterHR:any = null

  constructor(
    private auth: AuthService,
    private notifiSV: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.user = this.auth.userValue
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    
    
  }

  ngOnInit(): void {
    this.action = this.dialogData.action;
    this.title = this.dialogData.title;
    this.functionID = this.dialogRef.formModel.funcID;
    this.employee = JSON.parse(JSON.stringify(this.dialogData.employee));
    this.getParamerAsync(this.functionID);
  }
  // get parameter auto default number
  getParamerAsync(funcID:string){
    if(funcID)
    {
      this.api.execSv(
        "SYS",
        "ERM.Business.AD",
        "AutoNumberDefaultsBusiness",
        "GenAutoDefaultAsync",
        [funcID])
        .subscribe((res:any) => {
          if(res)
          {
            this.paramaterHR = JSON.parse(JSON.stringify(res));
          }
      });
    }
  }
  // set title popup
  setTile(event,form){
    form.title = this.title;
    this.detectorRef.detectChanges();
  }
  getDefaultEmployeeID(funcID:string,entityName:string,fieldName:string,data:any = null){
    if(funcID && entityName && fieldName){
      this.api.execSv(
        "SYS", 
        "ERM.Business.AD",
        "AutoNumbersBusiness",
        "GenAutoNumberAsync", // hòa kêu note lại
        [funcID, entityName, fieldName, null])
        .subscribe((res:any) =>{
          if(res)
          {
            this.defaultEmployeeID = res;
            this.employee.employeeID = this.defaultEmployeeID;
          }
          else
          {
            this.notifiSV.notifyCode("SYS020");
          }
        })
    }
    
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

  // btn save
  OnSaveForm() {
    if(this.action == "edit"){
      this.updateEmployeeAsync(this.employee);
    }
    else
    {
      this.addEmployeeAsync(this.employee);
    }
  }

  updateEmployeeAsync(employee:any){
    if(employee){
      this.api
        .execAction<boolean>(
         "HR_Employees",
          [employee],
          'UpdateAsync',
          true
        ).subscribe((res:any) =>{
            if(!res?.error){
              this.dialogRef.close(res.data);
            }
            else
            {
              this.notifiSV.notifyCode("SYS021");
              this.dialogRef.close(null);
            }
        });
    }
  }
  addEmployeeAsync(employee:any){
    if(employee){
      this.api.execSv(
        "HR",
        "ERM.Business.HR",
        "EmployeesBusiness",
        "UpdateEmployeeAsync",[employee])
        .subscribe((res:any) => {
        if(res){
          this.dialogRef.close(res);
        }
      })
    }
  }

  valueChange(event:any){
    console.log(event);
  }
  dataChange(e: any) {
    if(e)
    {
      this.employee[e.field] = e.data;
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
