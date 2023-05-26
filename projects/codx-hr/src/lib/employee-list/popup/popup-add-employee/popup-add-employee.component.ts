import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FilesService,
  FormModel,
  ImageViewerComponent,
  LayoutAddComponent,
  NotificationsService,
  Util,
} from 'codx-core';

@Component({
  selector: 'hr-popup-add-employee',
  templateUrl: './popup-add-employee.component.html',
  styleUrls: ['./popup-add-employee.component.css'],
})
export class PopupAddEmployeeComponent implements OnInit {
  data: any = null;
  headerText: string = '';
  action: string = '';
  formModel: FormModel = null;
  dialogRef: DialogRef = null;
  dialogData: any = null;
  grvSetUp: any[] = [];
  codxModifiedOn = new Date();
  employeeIDDisable: boolean = false;
  tabInfo: any[] = [
    {
      icon: 'icon-assignment_ind',
      text: 'Thông tin nhân viên',
      name: 'lblEmmployeeInfo',
    },
    {
      icon: 'icon-person',
      text: 'Thông tin cá nhân',
      name: 'lblPersonalInfo',
    },
    {
      icon: 'icon-folder_special',
      text: 'Pháp lý',
      name: 'lblLegalInfo',
    },
  ];

  @ViewChild('codxImg') codxImg: ImageViewerComponent;
  @ViewChild('form') form: LayoutAddComponent;

  constructor(
    private api: ApiHttpService,
    private notifySV: NotificationsService,
    private cache: CacheService,
    private fileSV: FilesService,
    private dt: ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogRef = dialogRef;
    this.formModel = dialogRef?.formModel;
    this.action = dialogData?.data?.action;
    this.headerText = dialogData?.data?.text;
    this.data = JSON.parse(JSON.stringify(dialogData?.data?.data));
    if(this.dialogRef.dataService.keyField === 'EmployeeID'){
      this.employeeIDDisable = false;
    }this.employeeIDDisable = true;
  }
  ngOnInit(): void {
    this.getGrvSetup(this.formModel.formName, this.formModel.gridViewName);
  }

  //get grvSetup
  getGrvSetup(fromName: string, grdViewName: string) {
    this.cache.gridViewSetup(fromName, grdViewName).subscribe((grv: any) => {
      if (grv) this.grvSetUp = grv;
    });
  }
  //set header text
  setTitle(e) {
    this.headerText += ' ' + e;
  }

  //value change
  valueChange(event: any) {
    if (event) {
      let field = Util.camelize(event.field);
      let value = event.data;
      this.data[field] = value;
      if (field === 'issuedOn') {
        let today = new Date();
        if (this.data.issuedOn >= today.toJSON()) {
          this.notifySV.notifyCode('HR012');
          //this.data[field] = null;
          return;
        }
      }
      if (field === 'birthday' && value) {
        if (!this.validateBirthday(value)) {
          this.notifySV.notifyCode('HR001');
          //this.data[field] = null;
          // this.form.formGroup.controls[field].patchValue({field : null});
          return;
        }
      }
      // if (field == 'positionID') {
      //   let itemSelected = event.component?.itemsSelected[0];
      //   if (itemSelected) {
      //     if (itemSelected['OrgUnitID']) {
      //       let orgUnitID = itemSelected['OrgUnitID'];
      //       if (orgUnitID != this.data['orgUnitID']) {
      //         this.form.formGroup.patchValue({ orgUnitID: orgUnitID });
      //         this.data['orgUnitID'] = orgUnitID;
      //       }
      //     }
      //     if (itemSelected['DepartmentID']) {
      //       let departmentID = itemSelected['DepartmentID'];
      //       if (departmentID != this.data['departmentID']) {
      //         this.form.formGroup.patchValue({ departmentID: departmentID });
      //         this.data['departmentID'] = departmentID;
      //       }
      //     }
      //     if (itemSelected['DivisionID']) {
      //       let divisionID = itemSelected['DivisionID'];
      //       if (divisionID != this.data['divisionID']) {
      //         this.form.formGroup.patchValue({ divisionID: divisionID });
      //         this.data['divisionID'] = divisionID;
      //       }
      //     }
      //     if (itemSelected['CompanyID']) {
      //       let companyID = itemSelected['CompanyID'];
      //       if (companyID != this.data['companyID']) {
      //         this.form.formGroup.patchValue({ companyID: companyID });
      //         this.data['companyID'] = companyID;
      //       }
      //     }
      //   }
      // }
    }
  }

  // validate age > 18
  validateBirthday(birthday: any) {
    let ageDifMs = Date.now() - Date.parse(birthday);
    let ageDate = new Date(ageDifMs);
    let age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }
  //click Button Save
  clickBtnSave() {
    if (this.checkValidate()) {
      this.action != 'edit'
        ? this.save(this.data, this.formModel.funcID)
        : this.update(this.data);
    }
  }

  //check validate
  checkValidate() {
    let arrFieldRequire = Object.values(this.grvSetUp).filter(
      (x: any) => x.isRequire
    );
    let arrFieldName = arrFieldRequire.map((x: any) => x.fieldName);
    if (arrFieldName.length > 0) {
      let strFieldUnValid: string = '';
      arrFieldName.forEach((key) => {
        if (!this.data[Util.camelize(key)])
          strFieldUnValid += this.grvSetUp[key]['headerText'] + ';';
      });
      if (strFieldUnValid) {
        this.notifySV.notifyCode('SYS009', 0, strFieldUnValid);
        return false;
      }
    }
    let today = new Date();
    if (this.data.issuedOn >= today.toJSON()) {
      this.notifySV.notifyCode('HR012');
      return false;
    }
    if (!this.validateBirthday(this.data.birthday) && this.data.birthday) {
      this.notifySV.notifyCode('HR001');
      return false;
    }

    return true;
  }

  //save data
  save(data: any, funcID: string) {
    if (data) {
      this.api
        .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'SaveAsync', [
          data,
          funcID,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.codxImg
              .updateFileDirectReload(res.employeeID)
              .subscribe((res2: any) => {
                this.notifySV.notifyCode('SYS006');
                this.dialogRef.close(res);
              });
          } else {
            this.notifySV.notifyCode('SYS023');
            this.dialogRef.close(null);
          }
        });
    }
  }
  //update data
  update(data: any) {
    if (data) {
      this.api
        .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'UpdateAsync', [
          data,
        ])
        .subscribe((res: any) => {
          this.notifySV.notifyCode(res ? 'SYS007' : 'SYS021');
          this.dialogRef.close(res ? data : null);
        });
    }
  }

  //
  changeAvatar(event: any) {
    this.codxModifiedOn = new Date();
    this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
  }
}
