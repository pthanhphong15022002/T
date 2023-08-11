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
import { ActivatedRoute } from '@angular/router';

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
      name: 'lblEmployeeInfo',
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

  trainFieldID: string = '';
  trainLevel: string = '';
  funcID: string = '';
  // orgNote: string = '';

  hasChangedData: boolean = false;
  constructor(
    private api: ApiHttpService,
    private notifySV: NotificationsService,
    private cache: CacheService,
    private fileSV: FilesService,
    private dt: ChangeDetectorRef,
    private routerActive: ActivatedRoute,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogRef = dialogRef;
    this.formModel = dialogRef?.formModel;
    this.action = dialogData?.data?.action;
    this.headerText = dialogData?.data?.text;
    this.data = JSON.parse(JSON.stringify(dialogData?.data?.data));
    this.funcID = this.routerActive.snapshot.params['funcID'];
    if (this.dialogRef.dataService.keyField === 'EmployeeID') {
      this.employeeIDDisable = true;
    } else this.employeeIDDisable = false;
    if (this.action === 'edit') this.employeeIDDisable = true;
  }
  ngOnInit(): void {
    this.getGrvSetup(this.formModel.formName, this.formModel.gridViewName);
    if (this.action === 'edit') {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'GetEmployeeInfoByIDAsync',
          [this.data.employeeID]
        ).subscribe(res => {
          if (res) {
            this.data = res;
            this.form.formGroup.patchValue(this.data);
            this.hasChangedData = false;
          }
        })
    }
    // this.getOrgNote();
  }

  //get grvSetup
  getGrvSetup(fromName: string, grdViewName: string) {
    this.cache.gridViewSetup(fromName, grdViewName).subscribe((grv: any) => {
      if (grv) {
        this.grvSetUp = grv;
      }
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
      if (this.data[field] !== value)
        this.hasChangedData = true;
      this.data[field] = value;

      switch (field) {
        case 'joinedOn':
          if (this.data[field] && this.data[field] > new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['JoinedOn']['headerText']);
          }
          break;
        case 'positionID':
          if (value) {
            this.api
              .execSv('HR', 'ERM.Business.HR', 'PositionsBusiness', 'GetPosInfoAsync', [value])
              .subscribe((posInfo: any) => {
                if (posInfo) {
                  this.data['jobLevel'] = posInfo.jobLevel ? posInfo.jobLevel : null;
                  this.data['orgUnitID'] = posInfo.orgUnitID ? posInfo.orgUnitID : null;
                  this.form.formGroup.patchValue({
                    jobLevel: this.data.jobLevel,
                    orgUnitID: this.data.orgUnitID,
                  });
                  // this.getOrgNote();
                }
              });
          }
          break;
        case 'orgUnitID':
          // this.getOrgNote();
          break;
        case 'issuedOn':
          if (this.data.issuedOn >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR012');
            return;
          }
          if (this.data.idExpiredOn && this.data.idExpiredOn < this.data.issuedOn) {
            this.notifySV.notifyCode('HR002');
          }
          break;
        case 'idExpiredOn':
          if (value && this.data.issuedOn) {
            if (this.data.idExpiredOn < this.data.issuedOn) {
              this.notifySV.notifyCode('HR002');
            }
          }
          break;
        case 'birthday':
          if (value) {
            if (!this.validateBirthday(value)) {
              this.notifySV.notifyCode('HR001');
            }
          }
          break;
        case 'provinceID':
          this.data['districtID'] = null;
          this.data['wardID'] = null;
          this.form.formGroup.patchValue({ districtID: null, wardID: null });
          break;
        case 'districtID':
          this.data['wardID'] = null;
          this.form.formGroup.patchValue({ wardID: null });
          break;
        case 'tProvinceID':
          this.data['tDistrictID'] = null;
          this.data['tWardID'] = null;
          this.form.formGroup.patchValue({ tDistrictID: null, tWardID: null });
          break;
        case 'tDistrictID':
          this.data['tWardID'] = null;
          this.form.formGroup.patchValue({ tWardID: null });
          break;;
        case 'trainLevel':
          if (this.data[field]) {
            this.trainLevel = event.component['dataSource'].find((x) => x.value == this.data[field])?.text;
            if (this.trainLevel && this.trainFieldID && !this.data['degreeName']) {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          } else {
            this.trainLevel = null;
          }
          break;
        case 'trainFieldID':
          if (this.data[field]) {
            this.trainFieldID = event.component.dataService?.data?.find((x) => x.TrainFieldID == this.data[field])?.TrainFieldName;
            if (this.trainLevel && this.trainFieldID && !this.data['degreeName']) {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          } else {
            this.trainFieldID = null;
          }
          break;
        case 'siRegisterOn':
          if (this.data['siRegisterOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['SIRegisterOn']['headerText']);
          }
          break;
        case 'pitIssuedOn':
          if (this.data['pitIssuedOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['PITIssuedOn']['headerText']);
          }
          break;
      }
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
    if (this.form.formGroup.invalid) {
      let arrFieldRequire = Object.values(this.grvSetUp).filter(
        (x: any) => x.isRequire
      );
      let arrFieldName = arrFieldRequire.map((x: any) => x.fieldName);
      if (arrFieldName.length > 0) {
        let strFieldUnValid: string = '';
        let hasManyValue = false;
        arrFieldName.forEach((key) => {
          if (key !== 'EmployeeID')
            if (!this.data[Util.camelize(key)])
              strFieldUnValid += (hasManyValue ? ', ' : '') + this.grvSetUp[key]['headerText'];
          if (strFieldUnValid.length > 0) hasManyValue = true;
        });
        if (strFieldUnValid) {
          this.notifySV.notifyCode('SYS009', 0, strFieldUnValid);
          return false;
        }
      }
    }

    if (this.data?.phone) {
      if (!this.validatePhoneNumber(this.data.phone, 'Phone'))
        return false;
    }

    if (this.data?.mobile) {
      if (!this.validatePhoneNumber(this.data.mobile, 'Mobile'))
        return false;
    }

    if (this.data?.email)
      if (!this.validateEmail(this.data.email, 'Email'))
        return false;
    if (this.data?.personalEmail)
      if (!this.validateEmail(this.data.personalEmail, 'PersonalEmail'))
        return false;

    let today = new Date().toJSON();
    if (this.data.issuedOn && this.data.issuedOn >= today) {
      this.notifySV.notifyCode('HR012');
      return false;
    }
    if (this.data.idExpiredOn && this.data.issuedOn && this.data.idExpiredOn < this.data.issuedOn) {
      this.notifySV.notifyCode('HR002');
      return false;
    }
    if (this.data.birthday) {
      if (!this.validateBirthday(this.data.birthday)) {
        this.notifySV.notifyCode('HR001');
        return false;
      }
    }
    if (this.data.joinedOn && this.data.joinedOn > today) {
      this.notifySV.notifyCode('HR014', 0, this.grvSetUp['JoinedOn']['headerText']);
      return false;
    }
    if (this.data.pitIssuedOn && this.data.pitIssuedOn > today) {
      this.notifySV.notifyCode('HR014', 0, this.grvSetUp['PITIssuedOn']['headerText']);
      return false;
    }
    if (this.data.siRegisterOn && this.data.siRegisterOn > today) {
      this.notifySV.notifyCode('HR014', 0, this.grvSetUp['SIRegisterOn']['headerText']);
      return false;
    }
    return true;
  }

  //save data
  save(data: any, funcID: string) {
    if (data) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'SaveWithOrgFieldAsync',
          [data, funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.codxModifiedOn = new Date();
            this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
            this.notifySV.notifyCode('SYS006');
            this.dialogRef.close(res);
          } else {
            this.notifySV.notifyCode('SYS023');
            this.dialogRef.close(null);
          }
        });
    }

  }
  //update data
  update(data: any) {
    if (this.hasChangedData) {
      if (data) {
        this.api
          .execSv(
            'HR',
            'ERM.Business.HR',
            'EmployeesBusiness',
            'UpdateWithOrgFieldAsync',
            [data]
          )
          .subscribe((res: any) => {
            if (res) {
              this.codxModifiedOn = new Date();
              this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
            }
            this.notifySV.notifyCode(res ? 'SYS007' : 'SYS021');
            this.dialogRef.close(res ? res : null);
          });
      }
    } else {
      this.notifySV.notifyCode('SYS007');
      this.dialogRef.close(null);
    }
  }

  //
  changeAvatar(event: any) {
    this.codxModifiedOn = new Date();
    this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
  }
  validateEmail(email: string, fieldName) {
    const regex = new RegExp(
      '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([A-Za-z]{2,6}(?:\\.[A-Za-z]{2,6})?)$'
    );
    if (regex.test(email) == false) {
      this.notifySV.notifyCode('HR022', 0, this.grvSetUp[fieldName]?.headerText);
      return false;
    }
    return true;
  }
  validatePhoneNumber(phone, fieldName) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    if (re.test(phone) == false) {
      this.notifySV.notifyCode('HR022', 0, this.grvSetUp[fieldName]?.headerText);
      return false;
    }
    return true;
  }

  // getOrgNote() {
  //   if (this.data['orgUnitID']) {
  //     this.orgNote = '';
  //     this.api.execSv<any>('HR', 'HR', 'OrganizationUnitsBusiness', 'GetOrgTreeByOrgIDAsync', [this.data['orgUnitID'], 9])
  //       .subscribe(res => {
  //         let resLength = res.length;
  //         if (res) {
  //           if(res[0].locationID){
  //             this.data['locationID'] = res[0].locationID;
  //             this.form.formGroup.controls['locationID'].patchValue(res[0].locationID);
  //           }
  //           if (resLength > 1) {
  //             this.orgNote = res[1].orgUnitName;
  //             if (resLength > 2) {
  //               for (var i = 2; i < resLength; i++) {
  //                 this.orgNote += ', ' + res[i].orgUnitName;
  //               }
  //             }
  //           }
  //         }
  //       });
  //   }
  // }
}
