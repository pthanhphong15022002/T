import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  Util,
} from 'codx-core';
import { Observable, Subject } from 'rxjs';
import { HR_Employees } from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-employees',
  templateUrl: './popup-add-employees.component.html',
  styleUrls: ['./popup-add-employees.component.css'],
})
export class PopupAddEmployeesComponent implements OnInit {
  title = '';
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
  dialogData: any = null;
  employee: HR_Employees;
  defaultEmployeeID: string = '';
  readOnly = false;
  showAssignTo = false;
  isSaving: boolean = false;
  isNew: boolean = true;
  currentSection = 'InfoPersonal';
  user: any;
  formName = '';
  gridViewName = '';
  functionID: string;
  isAfterRender = false;
  gridViewSetup: any;
  action: 'add' | 'edit' | 'copy' = 'add';
  paramaterHR: any = null;
  grvSetup:any = {};
  arrFieldRequire:any[] = [];
  mssgCode:string = "SYS009";
  @ViewChild("form") form:LayoutAddComponent;
  constructor(
    private auth: AuthService,
    private notifiSV: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.user = this.auth.userValue;
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    this.action = this.dialogData.action;
    this.title = this.dialogData.title;
    this.functionID = this.dialogRef.formModel.funcID;
    this.employee = JSON.parse(JSON.stringify(this.dialogData.employee));
    this.getParamerAsync(this.functionID);
    this.getGridViewSetup(this.dialogRef.formModel);
  }
  // get parameter auto default number
  getParamerAsync(funcID: string) {
    if (funcID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumberDefaultsBusiness',
          'GenAutoDefaultAsync',
          [funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.paramaterHR = JSON.parse(JSON.stringify(res));
          }
        });
    }
  }
  // get grvsetup
  getGridViewSetup(formModel:FormModel){
    if(formModel)
    { 
      this.cache.gridViewSetup(formModel.formName, formModel.gridViewName).subscribe((grd:any) => {
        if(grd){
          this.grvSetup = grd;
          let arrField =  Object.values(grd).filter((x:any) => x.isRequire);
          if(arrField){
            this.arrFieldRequire = arrField.map((x:any) => x.fieldName);
          }
        }
      });
    }
  }
  // set title popup
  setTile(event, form) {
    form.title = this.title;
    this.detectorRef.detectChanges();
  }
  getDefaultEmployeeID(
    funcID: string,
    entityName: string,
    fieldName: string,
    data: any = null
  ) {
    if (funcID && entityName && fieldName) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumbersBusiness',
          'GenAutoNumberAsync',
          [funcID, entityName, fieldName, null]
        )
        .subscribe((res: any) => {
          if (res) {
            this.defaultEmployeeID = res;
            this.employee.employeeID = this.defaultEmployeeID;
          } else {
            this.notifiSV.notifyCode('SYS020');
          }
        });
    }
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'GenAutoNumberAsync',
        [functionID, entityName, fieldName, null]
      )
      .subscribe((item) => {
        if (item) subject.next(item);
        else subject.next(null);
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
    data = [this.employee, this.isNew];
    op.data = data;
    return true;
  }

  // btn save
  OnSaveForm() {
    let arrFieldUnValid:string = "";
    if(this.arrFieldRequire.length > 0)
    {
      this.arrFieldRequire.forEach((field) => {
        let key = Util.camelize(field);
        if (!this.employee[key])
        {
          arrFieldUnValid += this.grvSetup[field]['headerText'] + ";";
        }
      });
    }
    if(arrFieldUnValid){
      this.notifiSV.notifyCode(this.mssgCode,0,arrFieldUnValid);
    }
    else
    {
      if (this.action == 'edit') {
        this.updateEmployeeAsync(this.employee);
      } else {
        this.addEmployeeAsync(this.employee);
      }
    }
  }

  updateEmployeeAsync(employee: any) {
    if (employee) {
      this.api
        .execAction<boolean>('HR_Employees', [employee], 'UpdateAsync', true)
        .subscribe((res: any) => {
          if (!res?.error) {
            this.dialogRef.close(res.data);
          } else {
            this.notifiSV.notifyCode('SYS021');
            this.dialogRef.close(null);
          }
        });
    }
  }
  addEmployeeAsync(employee: any) {
    if (employee) {
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","InsertAsync",[employee])
      .subscribe((res:any[]) => {
        if(res[0]){
          let data = res[1];
          this.notifiSV.notifyCode("SYS006");
          this.dialogRef.close(data);
        }
        else
        {
          this.notifiSV.notifyCode('SYS023');
          this.dialogRef.close(null);
        }
      });
    }
  }
  //value change
  dataChange(e: any) {
    // if (e) 
    // {
    //   let field = Util.camelize(e.field);
    //   let data = e.data;
    //   this.employee[field] = data;
    // }
  }
}
