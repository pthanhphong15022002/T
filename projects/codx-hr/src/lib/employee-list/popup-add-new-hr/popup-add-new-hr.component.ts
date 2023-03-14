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
  RequestOption,
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
  actionType: string;
  dialog: DialogRef;
  // formModel: FormModel;
  funcID;

  @ViewChild('form', { static: true }) form: LayoutAddComponent;

  data;
  title = '';
  hrID;
  tabInfo: any[] = [
    {
      icon: 'icon-assignment_ind',
      text: 'Thông tin nhân viên',
      name: 'emmployeeInfo',
    },
    {
      icon: 'icon-person',
      text: 'Thông tin cá nhân',
      name: 'personalInfo',
    },
    {
      icon: 'icon-folder_special',
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

  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,

    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    console.log('dialog', this.dialog);

    this.data = this.dialog.dataService.dataSelected;

    this.actionType = dialogData?.data?.actionType;

    // this.formModel = ;
    this.funcID = this.dialog.formModel.funcID;
  }

  onInit(): void {
    // if(!this.formModel)
    // this.cache
    //   .gridViewSetup(
    //     this.dialog.formModel.formName,
    //     this.dialog.formModel.gridViewName
    //   )
    //   .subscribe((res) => {
    //     this.formModel = res;
    //   });
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

  beforeSave(option: RequestOption) {
    option.assemblyName = 'ERM.Business.HR';
    option.className = 'EmployeesBusiness';

    let itemData = this.data;
    if (this.actionType == 'add') {
      option.methodName = 'AddEmployeeAsync';
    } else {
      if (this.actionType == 'copy') {
        option.methodName = 'AddNewAsync';
      } else option.methodName = 'EditAsync';
    }

    option.data = [itemData, this.funcID];
    return true;
  }

  onSaveForm() {
    // if(this.form.formGroup.invalid){
    //   this.hrService.notifyInvalid(this.form.formGroup, this.form.formModel);
    //   return;
    // }

    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.update || res.save) {
          let result = res.save;

          if (res.update) {
            result = res.update;
          }
          this.data = result;
          this.dialog && this.dialog.close(result);
        }
      });
  }

  
}
