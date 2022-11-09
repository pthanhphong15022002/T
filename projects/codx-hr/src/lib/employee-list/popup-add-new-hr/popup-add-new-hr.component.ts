import {
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
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { HR_Employees_Extend } from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-popup-add-new-hr',
  templateUrl: './popup-add-new-hr.component.html',
  styleUrls: ['./popup-add-new-hr.component.scss'],
})
export class PopupAddNewHRComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(inject);
    this.dialogRef = dialogRef;
    console.log(this.dialogRef);
    this.data = this.dialogRef.dataService.dataSelected;
    console.log('data', this.data);

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

  validateFields = [
    'birthday',
    'issuedOn',
    'iDExpiredOn',
    'degreeName',
    'trainFieldID',
    'trainLevel',
    '',
    '',
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
        console.log('form model', this.form);
      });

    //add validator (BA request)
  }

  ngViewInit() {
    this.form.formGroup.controls[this.validateFields[0]]?.addValidators(
      this.olderThan18(this.form.formGroup.controls[this.validateFields[0]])
    );
  }

  test(e) {
    console.log('vlc', e);
  }
  olderThan18(formControl: AbstractControl): ValidatorFn {
    return (): ValidationErrors | null => {
      {
        let result =
          new Date().getFullYear() -
            new Date(formControl.value).getFullYear() >=
          18
            ? { formControl: { value: formControl.value } }
            : null;
        console.log('result', result);

        return result;
      }
    };
  }

  buttonClick(e: any) {
    console.log(e);
  }
  setTitle(e) {
    console.log('setTitle not done yet');

    this.title = e;
  }
  changeID(e) {
    console.log('changeID not done yet');
  }
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
        }
      }
      console.log('form group khong hop le', invalidControls);
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
