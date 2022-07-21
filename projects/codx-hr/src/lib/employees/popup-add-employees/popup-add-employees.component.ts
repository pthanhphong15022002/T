import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
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
  title = 'Thêm mới';
  dialog: any;
  employee: HR_Employees = new HR_Employees();
  readOnly = false;
  showAssignTo = false;
  isSaving: boolean = false;
  isNew: boolean = true;
  dataBind: any = {};
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
    this.employee = {
      ...this.employee,
      ...dt?.data,
    };
     this.action = dt.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.data = dialog.dataService!.dataSelected;
    this.employee = this.data;
   }

  ngOnInit(): void {
    this.initForm();
    this.cache.gridViewSetup('Employees', 'grvEmployees').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    });
    if(this.action==='edit'){
      this.title = 'Chỉnh sửa';
    }
    if(this.action==='copy'){
      this.title = 'Sao chép';
    }
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      this.getAutonumber("HRT03", "HR_Employees", "EmployeeID").subscribe(key => {
        this.employee.employeeID = key;
      })
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

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateAsync';
    data = [
      this.employee,
      this.isNew
    ];
    op.data = data;
    return true;
  }
  
  OnSaveForm(){
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.save) {
        this.dialog.close();
        this.notiService.notify('Thêm thành công'); 
      }
    });
  }

  addEmployee() {
    var t = this;
    this.dialog.dataService.save((opt:any)=>{
      opt.data = [this.employee];
      return true;
    })
    .subscribe((res) => {
      if (res.save) {
        this.dialog.close();
        this.notiService.notify('Thêm mới thành công');
      }
    });
  }

  closePanel() {
    this.dialog.close()
  }

  scrollTo(session) {
    this.currentSection = session;
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.employee[field] = e?.data;
      } else {
        this.employee[field] = e[0];
      }
    }
  }
  changeTime(data){
    if (!data.field || !data.data) return;
    this.employee[data.field] = data.data?.fromDate;
  }
}
