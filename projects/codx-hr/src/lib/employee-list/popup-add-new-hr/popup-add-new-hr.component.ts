import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import {
  HR_Employees_Extend,
  HR_Validator,
} from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-new-hr',
  templateUrl: './popup-add-new-hr.component.html',
  styleUrls: ['./popup-add-new-hr.component.scss'],
})
export class PopupAddNewHRComponent
  extends UIComponent
  implements AfterViewInit
{
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(inject);
    this.dialogRef = dialogRef;
    this.data = this.dialogRef.dataService.dataSelected;

    // this.formModel = ;
    this.funcID = this.dialogRef.formModel.funcID;
  }
  dialogRef: DialogRef;
  formModel: FormModel;
  funcID;

  @ViewChild('form', { static: true }) form: LayoutAddComponent;

  data;
  title = '';
  hrID;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin nhân viên',
      name: 'emmployeeInfo',
    },
    {
      icon: 'icon-receipt_long',
      text: 'Thông tin cá nhân',
      name: 'personalInfo',
    },
    {
      icon: 'icon-business_center',
      text: 'Pháp lý',
      name: 'legalInfo',
    },
  ];

  validateFields: Array<HR_Validator> = [
    { field: 'birthday', error: 'HR001' },
    { field: 'issuedOn', error: '' },
    { field: 'iDExpiredOn', error: '' },
    { field: 'degreeName', error: '' },
    { field: 'trainFieldID', error: '' },
    { field: 'trainLevel', error: '' },
  ];

  onInit(): void {
    //nho xoa
    this.hrID = 'Dang test';
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.formModel = res;
      });

    //add validator (BA request)
  }

  ngAfterViewInit() {
    let formControl =
      this.form?.formGroup?.controls[this.validateFields[0].field];
    formControl?.addValidators(this.olderThan18(formControl));
  }

  olderThan18(formControl: AbstractControl): ValidatorFn {
    return (): ValidationErrors | null => {
      {
        let birthday = new Date(formControl.value).valueOf();
        let today = new Date().valueOf();
        let diffMS = today - birthday;
        let diff = new Date(diffMS).getFullYear() - 1970;

        let result =
          diff >= 18 ? null : { formControl: { value: formControl.value } };
        return result;
      }
    };
  }

  buttonClick(e: any) {
    console.log(e);
  }
  setTitle(e) {
    this.title = e;
  }
  changeID(e) {}
  OnSaveForm() {
    if (this.form.formGroup.valid) {
      let tmpHR: HR_Employees_Extend = this.form.formGroup.value;
      this.addEmployeeAsync(tmpHR);
    } else {
      let controls = this.form.formGroup.controls;
      let invalidControls = [];

      for (let control in controls) {
        if (controls[control].invalid) {
          invalidControls.push(control);
          let curHR_Validator = this.validateFields.find(
            (field) => field.field == control
          );
          this.notify.notifyCode(curHR_Validator.error);
        }
      }
    }
  }

  addEmployeeAsync(employee: any) {
    if (employee) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'AddEmployeeAsync',
          [employee, this.funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.dialogRef.close(res);
          }
        });
    }
  }
}
