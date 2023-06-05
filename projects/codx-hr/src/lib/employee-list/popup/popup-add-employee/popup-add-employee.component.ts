import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
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
  // orgNote: string = '';
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
    if (this.dialogRef.dataService.keyField === 'EmployeeID') {
      this.employeeIDDisable = true;
    } else this.employeeIDDisable = false;
  }
  ngOnInit(): void {
    this.getGrvSetup(this.formModel.formName, this.formModel.gridViewName);
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
      this.data[field] = value;

      switch (field) {
        case 'joinedOn':
          if (this.data[field] && this.data[field] > new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['JoinedOn']['headerText']);
            return;
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
            //this.data[field] = null;
            return;
          }
          if (this.data.idExpiredOn && this.data.idExpiredOn < this.data.issuedOn) {
            this.notifySV.notifyCode('HR002');
            return;
          }
          break;
        case 'idExpiredOn':
          if (value && this.data.issuedOn) {
            if (this.data.idExpiredOn < this.data.issuedOn) {
              this.notifySV.notifyCode('HR002');
              return;
            }
          }
          break;
        case 'birthday':
          if (value) {
            if (!this.validateBirthday(value)) {
              this.notifySV.notifyCode('HR001');
              //this.data[field] = null;
              // this.form.formGroup.controls[field].patchValue({field : null});
              return;
            }
          }
          break;
        case 'provinceID':
          this.data['districtID'] = null;
          this.data['wardID'] = null;
          this.form.formGroup.controls['districtID'].patchValue(null);
          this.form.formGroup.controls['wardID'].patchValue(null);
          break;
        case 'tProvinceID':
          this.data['tDistrictID'] = null;
          this.data['tWardID'] = null;
          this.form.formGroup.controls['tDistrictID'].patchValue(null);
          this.form.formGroup.controls['tWardID'].patchValue(null);
          break;
        case 'trainLevel':
          if (this.data[field]) 
          {
            this.trainLevel = event.component['dataSource'].find((x) => x.value == this.data[field]).text;
            if (this.trainLevel.length > 0 && this.trainFieldID.length > 0 
              &&(!this.data['degreeName'] || this.data['degreeName'] == '')) 
            {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          }
          break;
        case 'trainFieldID':
          if (this.data[field]) 
          {
            this.trainFieldID = event.component.dataService.data.find((x) => x.TrainFieldID == this.data[field]).TrainFieldName;
            if (this.trainLevel.length > 0 && this.trainFieldID.length > 0
              && (!this.data['degreeName'] || this.data['degreeName'] == '')) {
              this.data['degreeName'] = this.trainLevel + ' ' + this.trainFieldID;
              this.form.formGroup.controls['degreeName'].patchValue(this.data['degreeName']);
            }
          }
          break;
        case 'siRegisterOn':
          if (this.data['siRegisterOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['SIRegisterOn']['headerText']);
            this.data[field] = null;
            this.form.formGroup.controls[field].patchValue(null);
            return;
          }
          break;
        case 'pitIssuedOn':
          if (this.data['pitIssuedOn'] >= new Date().toJSON()) {
            this.notifySV.notifyCode('HR014', 0, this.grvSetUp['PITIssuedOn']['headerText']);
            this.data[field] = null;
            this.form.formGroup.controls[field].patchValue(null);
            return;
          }
          break;
      }
    }
  }

  // validate age > 18
  validateBirthday(birthday: any) {
    if(birthday) return false;
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
        arrFieldName.forEach((key) => {
          if (!this.data[Util.camelize(key)])
            strFieldUnValid += this.grvSetUp[key]['headerText'] + '; ';
        });
        if (strFieldUnValid) {
          this.notifySV.notifyCode('SYS009', 0, strFieldUnValid);
          return false;
        }
      }
    }


    let today = new Date();
    if (this.data.issuedOn >= today.toJSON()) {
      this.notifySV.notifyCode('HR012');
      return false;
    }
    if (this.data.idExpiredOn < this.data.issuedOn) {
      this.notifySV.notifyCode('HR002');
      return false;
    }
    if (!this.validateBirthday(this.data.birthday)) {
      this.notifySV.notifyCode('HR001');
      return false;
    }
    if (this.data.joinedOn && this.data.joinedOn > today.toJSON()) {
      this.notifySV.notifyCode('HR014', 0, this.grvSetUp['JoinedOn']['headerText']);
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
            this.codxImg
              .updateFileDirectReload(res.employeeID)
              .subscribe((res2: any) => {
                this.notifySV.notifyCode('SYS006');
                this.dialogRef.close(res);
              });
            this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
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
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'UpdateWithOrgFieldAsync',
          [data]
        )
        .subscribe((res: any) => {
          this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
          this.notifySV.notifyCode(res ? 'SYS007' : 'SYS021');
          this.dialogRef.close(res ? data : null);
        });
    }
  }

  //
  changeAvatar(event: any) {
    this.codxModifiedOn = new Date();
    //this.fileSV.dataRefreshImage.next({ userID: this.data.employeeID });
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
