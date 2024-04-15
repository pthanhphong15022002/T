import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'lib-popup-add-organization',
  templateUrl: './popup-add-organization.component.html',
  styleUrls: ['./popup-add-organization.component.css'],
})
export class PopupAddOrganizationComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  // input
  funcID: string = '';
  action: any = null;
  headerText: string = '';
  isModeAdd: boolean = false;
  dialogData: any = null;
  dialogRef: DialogRef = null;
  //
  func: any = null;
  grdViewSetup: any = null;
  user: any = null;
  data: any = null;
  parameterHR: any = null;
  formGroup: FormGroup;

  msgCodeError: string = 'SYS009';
  orgUnitName: string = 'Đơn vị';
  formModel: FormModel;

  constructor(
    private auth: AuthService,
    private cache: CacheService,
    private notifiSV: NotificationsService,
    private hrSevice: CodxHrService,
    private api: ApiHttpService,

    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.formModel = dialogRef?.formModel;
    this.user = this.auth.userValue;
    this.dialogData = dt.data;
    this.dialogRef = dialogRef;
    if (this.dialogData) {
      this.funcID = this.dialogData.funcID;
      this.action = this.dialogData.action;
      this.data = JSON.parse(JSON.stringify(this.dialogData.data));
      this.isModeAdd = this.dialogData.isModeAdd;
    }
  }

  ngOnInit(): void {
    if (this.funcID) {
      this.getSetup(this.funcID);
      this.getParamerAsync(this.funcID);
    }
  }
  ngAfterViewInit() {
    this.formGroup = this.form.formGroup;
  }

  // get setup
  getSetup(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (func) {
          this.func = func;
          this.headerText = this.action.text + ' ' + func.description;
          if (func?.formName && func?.gridViewName) {
            this.cache
              .gridViewSetup(func.formName, func.gridViewName)
              .subscribe((grd: any) => {
                if (grd) {
                  this.grdViewSetup = grd;
                }
              });
          }
        }
      });
    }
  }
  // get parameter auto number
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
            this.parameterHR = JSON.parse(JSON.stringify(res));
          }
        });
    }
  }
  // value change
  valueChange(event: any) {
    if (event) {
      //Patch data to form group to work validate
      this.formGroup.patchValue(this.data);
      this.data[event.field] = event.data;
    }
  }
  // btn save
  onSave() {
    this.formGroup.patchValue(this.data);

    if (this.data.email && !this.hrSevice.checkEmail(this.data.email)) {
      this.notifiSV.notifyCode('SYS037');
      return;
    }

    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.dialogRef.formModel);
      return;
    }
    if (this.action.functionID === 'SYS03') {
      this.editData(this.data);
    } else {
      this.saveData(this.data);
    }
  }

  // insert
  saveData(data: any) {
    if (data) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness_Old',
          'SaveAsync',
          [data, this.funcID]
        )
        .subscribe((res: any) => {
          if (res) this.notifiSV.notifyCode('SYS006');
          else this.notifiSV.notifyCode('SYS023');
          this.dialogRef.close(res);
        });
    }
  }
  // edit
  editData(data: any) {
    if (data) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness_Old',
          'UpdateAsync',
          [data]
        )
        .subscribe((res: any) => {
          let mssgCode = res ? 'SYS007' : 'SYS021';
          this.notifiSV.notifyCode(mssgCode);
          this.dialogRef.close(res);
        });
    }
  }
}
