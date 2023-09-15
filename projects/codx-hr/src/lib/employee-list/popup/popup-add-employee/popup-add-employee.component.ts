import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxComboboxComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FilesService,
  FormModel,
  ImageViewerComponent,
  LayoutAddComponent,
  NotificationsService,
  Util,
  ValueListComponent,
} from 'codx-core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hr-popup-add-employee',
  templateUrl: './popup-add-employee.component.html',
  styleUrls: ['./popup-add-employee.component.css'],
})
export class PopupAddEmployeeComponent implements OnInit {
  @ViewChild('codxImg') codxImg: ImageViewerComponent;
  @ViewChild('form') form: LayoutAddComponent;
  @ViewChild('cbxTrain') cbxTrain: any;
  @ViewChild('vllTrainLevel') vllTrainLevel: any;
  @ViewChild('cbxPosition') cbxPosition: any;
  @ViewChild('cbxJobLevel') cbxJobLevel: any;

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
  trainFieldID: string = '';
  trainLevel: string = '';
  funcID: string = '';
  // orgNote: string = '';
  oldEmployeeID: string = '';

  hasChangedData: boolean = false;
  hasAutoFillJobLevel: boolean = false;
  oldAddress: string = '';
  oldTAddress: string = '';
  settingValues: any;
  constructor(
    private api: ApiHttpService,
    private notifySV: NotificationsService,
    private cache: CacheService,
    private fileSV: FilesService,
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

    if (this.action === 'edit') {
      this.employeeIDDisable = true;
      this.oldEmployeeID = this.data.employeeID;
    }
    else {
      this.employeeIDDisable = this.dialogRef.dataService.keyField ? true : false;
    }
  }
  ngOnInit(): void {
    this.getGrvSetup(this.formModel.formName, this.formModel.gridViewName);
    this.getHRParameters();
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
            this.oldAddress = this.data?.address;
            this.oldTAddress = this.data?.tAddress;
          }
        })
    } else this.hasChangedData = true;
  }
  ngAfterViewInit() {
    this.form.formGroup.patchValue({ joinedOn: null }); // fix tạm bằng cách gán cứng
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
  hasChangeAva(event) {
    this.hasChangedData = true;
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
          if (!this.hasChangedData) break;
          if (this.data[field] && this.data[field] > new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['JoinedOn']['headerText']);
          }
          break;
        case 'positionID':
          if (value && this.hasChangedData) {
            if (event?.component?.dataService?.data.findIndex(x => x.PositionID == value) < 0) {
              this.notifySV.notifyCode('HR022', 0, this.grvSetUp['PositionID']['headerText']);
              return;
            }
            this.api.execSv('HR', 'ERM.Business.HR', 'PositionsBusiness', 'GetPosInfoAsync', [value])
              .subscribe((posInfo: any) => {
                if (posInfo) {
                  if (posInfo.jobLevel) {
                    this.hasAutoFillJobLevel = true;
                    this.data['jobLevel'] = posInfo.jobLevel;
                    this.form.formGroup.patchValue({
                      jobLevel: this.data.jobLevel,
                    });
                  }
                  if (posInfo.orgUnitID) {
                    this.data['orgUnitID'] = posInfo.orgUnitID ? posInfo.orgUnitID : null;
                    this.form.formGroup.patchValue({
                      orgUnitID: this.data.orgUnitID,
                    });
                  }
                  // this.getOrgNote();
                }
              });
          }
          break;
        // case 'orgUnitID':
        // this.getOrgNote();
        // break;
        case 'jobLevel':
          if (value && this.hasChangedData) {
            if (event?.component?.dataService?.data.findIndex(x => x.JobLevel == value) < 0 && !this.hasAutoFillJobLevel) {
              this.notifySV.notifyCode('HR022', 0, this.grvSetUp['JobLevel']['headerText']);
              return;
            }
            this.hasAutoFillJobLevel = false;
          }
          break;
        case 'issuedOn':
          if (!this.hasChangedData) break;
          if (this.data.issuedOn >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR012');
            return;
          }
          if (this.data.idExpiredOn && this.data.idExpiredOn < this.data.issuedOn) {
            this.notifySV.notifyCode('HR002');
          }
          break;
        case 'idExpiredOn':
          if (!this.hasChangedData) break;
          if (value && this.data.issuedOn) {
            if (this.data.idExpiredOn < this.data.issuedOn) {
              this.notifySV.notifyCode('HR002');
            }
          }
          break;
        case 'birthday':
          if (!this.hasChangedData) break;
          if (value) {
            if (!this.validateBirthday(value)) {
              this.notifySV.notifyCode('HR001');
            }
          }
          break;
        // case 'address':
        //   break;
        case 'provinceID':
          if (!this.hasChangedData) break;
          this.data['districtID'] = null;
          this.data['wardID'] = null;
          this.form.formGroup.patchValue({ districtID: null, wardID: null });
          break;
        case 'districtID':
          if (!this.hasChangedData) break;
          this.data['wardID'] = null;
          this.form.formGroup.patchValue({ wardID: null });
          break;
        // case 'tAddress':
        //   break;
        case 'tProvinceID':
          if (!this.hasChangedData) break;
          this.data['tDistrictID'] = null;
          this.data['tWardID'] = null;
          this.form.formGroup.patchValue({ tDistrictID: null, tWardID: null });
          break;
        case 'tDistrictID':
          if (!this.hasChangedData) break;
          this.data['tWardID'] = null;
          this.form.formGroup.patchValue({ tWardID: null });
          break;
        case 'trainFieldID':
          if (this.data[field]) {
            this.trainFieldID = event.component.dataService?.data?.find((x) => x.TrainFieldID == this.data[field])?.TrainFieldName;
            if (!this.trainLevel && this.trainFieldID?.length > 0) {
              this.trainLevel = this.vllTrainLevel.ComponentCurrent.dataSource.find(x => x.value == this.data['trainLevel'])?.text;
              //this.trainLevel = this.data['degreeName'].replace(" " + this.trainFieldID, "");
            }
            if (this.trainLevel && this.trainFieldID && this.hasChangedData) {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          } else {
            this.trainFieldID = null;
          }
          break;
        case 'trainLevel':
          if (this.data[field]) {
            this.trainLevel = event.component['dataSource'].find((x) => x.value == this.data[field])?.text;
            if (!this.trainFieldID && this.trainLevel?.length > 0) {
              this.trainFieldID = this.cbxTrain.ComponentCurrent.dataService.data[0]?.TrainFieldName;
              // this.trainFieldID = this.data['degreeName'].replace(this.trainLevel + " ", "");
            }
            if (this.trainLevel && this.trainFieldID && this.hasChangedData) {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          } else {
            this.trainLevel = null;
          }
          break;
        case 'siRegisterOn':
          if (!this.hasChangedData) break;
          if (this.data['siRegisterOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['SIRegisterOn']['headerText']);
          }
          break;
        case 'pitIssuedOn':
          if (!this.hasChangedData) break;
          if (this.data['pitIssuedOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['PITIssuedOn']['headerText']);
          }
          break;
      }
    }
  }
  blurInput(event: any) {
    if (event?.ControlName) {
      switch (event?.ControlName) {
        case 'address':
          if (this.oldAddress != this.data['address']) {
            this.api.execSv('BS', 'ERM.Business.BS', 'ProvincesBusiness', 'GetLocationAsync', [this.data['address'], 1])
              .subscribe((res: any) => {
                if (res) {
                  let result = JSON.parse(res);
                  if (result?.ProvinceID?.length > 0 && result?.ProvinceID != this.data['provinceID']) this.data['provinceID'] = result.ProvinceID;
                  if (result?.DistrictID?.length > 0 && result?.DistrictID != this.data['districtID']) this.data['districtID'] = result.DistrictID;
                  if (result?.WardID?.length > 0 && result?.WardID != this.data['wardID']) this.data['wardID'] = result.WardID;
                  this.form.formGroup.patchValue({
                    provinceID: this.data['provinceID'],
                    districtID: this.data['districtID'],
                    wardID: this.data['wardID'],
                  }
                  );
                  this.validateAddress('address', this.settingValues.ControlInputAddress)
                }
              })
            this.oldAddress = this.data['address'];
          }
          break;
        case 'tAddress':
          if (this.oldTAddress != this.data['tAddress']) {
            this.api.execSv('BS', 'ERM.Business.BS', 'ProvincesBusiness', 'GetLocationAsync', [this.data['tAddress'], 1])
              .subscribe((res: any) => {
                if (res) {
                  let result = JSON.parse(res);
                  if (result?.ProvinceID?.length > 0 && result?.ProvinceID != this.data['tProvinceID']) this.data['tProvinceID'] = result.ProvinceID;
                  if (result?.DistrictID?.length > 0 && result?.DistrictID != this.data['tDistrictID']) this.data['tDistrictID'] = result.DistrictID;
                  if (result?.WardID?.length > 0 && result?.WardID != this.data['tWardID']) this.data['tWardID'] = result.WardID;
                  this.form.formGroup.patchValue({
                    tProvinceID: this.data['tProvinceID'],
                    tDistrictID: this.data['tDistrictID'],
                    tWardID: this.data['tWardID'],
                  });
                  this.validateAddress('tAddress', this.settingValues.ControlInputAddress)
                }
              })
            this.oldTAddress = this.data['tAddress'];
          }
          break;
      }
    }
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
  validateAddress(fieldName: string, addressLevel = '0') {
    switch (fieldName) {
      case 'tAddress':
        if (this.data['tAddress']?.length < 0 || this.data['tAddress'] == null) return true;
        if (addressLevel == '0') {
          console.log(false);
          return false;
        };
        if (addressLevel == '1' && !this.data['tProvinceID']) {
          console.log(false);
          return false;
        };
        if (addressLevel == '2' && (!this.data['tProvinceID'] || !this.data['tDistrictID'])) {
          console.log(false);
          return false;
        };
        if (addressLevel == '3' && (!this.data['tProvinceID'] || !this.data['tDistrictID'] || !this.data['tWardID'])) {
          console.log(false);
          return false;
        };
        return true;
      case 'address':
        if (this.data['address']?.length < 0 || this.data['address'] == null) return true
        if (addressLevel == '0') {
          console.log(false);
          return false;
        };
        if (addressLevel == '1' && !this.data['provinceID']) {
          console.log(false);
          return false;
        };
        if (addressLevel == '2' && (!this.data['provinceID'] || !this.data['districtID'])) {
          console.log(false);
          return false;
        };
        if (addressLevel == '3' && (!this.data['provinceID'] || !this.data['districtID'] || !this.data['wardID'])) {
          console.log(false);
          return false;
        };
        return true;
    }
    return true;
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
  validateBirthday(birthday: any) {
    let ageDifMs = Date.now() - Date.parse(birthday);
    let ageDate = new Date(ageDifMs);
    let age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }
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
    if (this.data?.positionID) {
      if (this.cbxPosition?.ComponentCurrent?.dataService?.data.findIndex(x => x.PositionID == this.data.positionID) < 0) {
        this.notifySV.notifyCode('HR022', 0, this.grvSetUp['PositionID']['headerText']);
        return false;
      }
    }
    if (this.data?.jobLevel) {
      if (this.cbxJobLevel?.ComponentCurrent?.dataService?.data.findIndex(x => x.JobLevel == this.data.jobLevel) < 0) {
        this.notifySV.notifyCode('HR022', 0, this.grvSetUp['JobLevel']['headerText']);
        return false;
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
    if (!this.validateAddress('address', this.settingValues.ControlInputAddress)){
      return false
    }
    if (!this.validateAddress('tAddress', this.settingValues.ControlInputAddress)){
      return false
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
            this.data.employeeID = res.employeeID;
            if (this.codxImg?.data?.url) {
              this.codxImg.objectId = res.employeeID;
              this.codxImg.uploadAvatar()
            }
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
            // [data, this.oldEmployeeID]
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


  getHRParameters() {
    this.api.execSv("HR", "ERM.Business.HR", "EmployeesBusiness", "GetHRParameterSetting")
      .subscribe(res => {
        if (res) this.settingValues = JSON.parse(res.toString())
      });
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
