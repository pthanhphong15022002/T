import { CodxAdService } from './../../codx-ad.service';
import { AD_User } from './../../models/AD_User.models';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  CallFuncService,
  AuthStore,
  ImageViewerComponent,
  CodxService,
  ViewsComponent,
  SidebarModel,
  FormModel,
  CacheService,
  RequestOption,
  CRUDService,
  UIComponent,
  DialogModel,
  NotificationsService,
  LayoutAddComponent,
} from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { throws } from 'assert';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AnyRecordWithTtl } from 'dns';
import { AD_Roles } from '../../models/AD_Roles.models';
import { AD_UserRoles } from '../../models/AD_UserRoles.models';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent extends UIComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;
  @ViewChild('form') form: LayoutAddComponent;
  @Output() loadData = new EventEmitter();

  title = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  readOnly = false;
  isAddMode = true;
  user: any;
  adUser = new AD_User();
  adRoles: AD_Roles = new AD_Roles();
  adUserRoles: AD_UserRoles = new AD_UserRoles();
  countListViewChooseRoleApp: Number = 0;
  countListViewChooseRoleService: Number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  viewChooseRoleTemp: tmpformChooseRole[] = [];
  formModel: FormModel;
  formType: any;
  formGroupAdd: FormGroup;
  gridViewSetup: any = [];
  checkBtnAdd = false;
  saveSuccess = false;
  dataAfterSave: any;
  countOpenPopRoles = 0;
  formUser: FormGroup;

  constructor(
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private auth: AuthStore,
    private adService: CodxAdService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.formType = dt?.data?.formType;
    this.data = dialog.dataService!.dataSelected;
    if (this.formType == 'edit') {
      this.viewChooseRole = this.data?.chooseRoles;
      this.viewChooseRoleTemp = JSON.parse(
        JSON.stringify(this.data?.chooseRoles)
      );
      this.countListViewChoose();
    }
    this.adUser = JSON.parse(JSON.stringify(this.data));
    this.dialog = dialog;
    this.user = auth.get();

    this.cache.gridViewSetup('Users', 'grvUsers').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.title = 'Cập nhật người dùng';
      this.isAddMode = false;
    } else this.title = this.form?.title;
    this.formGroupAdd = new FormGroup({
      userName: new FormControl('', Validators.required),
      buid: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
    });
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.dialog.closed.subscribe((res) => {
      if (!this.saveSuccess) {
        if (this.dataAfterSave && this.dataAfterSave.userID) {
          this.adService.deleteUserBeforeDone(this.dataAfterSave).subscribe();
        }
      }
    });
    this.initForm();
  }

  initForm() {
    this.adService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((dt) => {
        if (dt) {
          this.formUser = dt;
        }
      });
  }

  openPopup(item: any) {
    // this.formUser.patchValue(this.adUser);
    // if (this.formUser.invalid) {
    //   this.adService.notifyInvalid(this.formUser, this.formModel);
    //   return;
    // } else {
      this.countOpenPopRoles++;
      if (this.formType == 'add') {
        if (this.countOpenPopRoles == 1) this.addUserTemp();
      }
      var option = new DialogModel();
      option.FormModel = this.form.formModel;
      var obj = {
        formType: this.formType,
        data: item,
      };
      this.dialogRole = this.callfc.openForm(
        PopRolesComponent,
        '',
        1200,
        700,
        '',
        obj,
        '',
        option
      );
      this.dialogRole.closed.subscribe((e) => {
        if (e?.event) {
          this.viewChooseRole = e?.event;
          this.countListViewChoose();
          this.viewChooseRole.forEach((dt) => {
            dt['module'] = dt.functionID;
            dt['roleID'] = dt.recIDofRole;
            dt.userID = this.adUser.userID;
          });
          this.changeDetector.detectChanges();
        }
      });
    // }
  }

  addUserTemp() {
    this.checkBtnAdd = true;
    this.formUser.patchValue(this.adUser);
    if (this.formUser.invalid) {
      this.adService.notifyInvalid(this.formUser, this.formModel);
      return;
    } else {
      this.dialog.dataService
        .save((opt: any) => this.beforeSaveTemp(opt), 0)
        .subscribe((res) => {
          if (res.save) {
            this.imageUpload
              .updateFileDirectReload(res.save.userID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
              });
            this.dataAfterSave = res.save;
          }
        });
    }
  }

  countListViewChoose() {
    if (this.viewChooseRole) {
      this.countListViewChooseRoleApp = this.viewChooseRole.filter(
        (obj) => obj.isPortal == false
      ).length;
      this.countListViewChooseRoleService = this.viewChooseRole.filter(
        (obj) => obj.isPortal == true
      ).length;
    }
  }

  beforeSave(op: RequestOption) {
    var data = [];
    var checkDifference =
      JSON.stringify(this.viewChooseRoleTemp) ===
      JSON.stringify(this.viewChooseRole);
    if (this.formType == 'add') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      data = [this.adUser, this.viewChooseRole, true];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      data = [this.adUser, this.viewChooseRole, checkDifference];
    }
    op.data = data;
    return true;
  }

  beforeSaveTemp(op: RequestOption) {
    var data = [];
    this.isAddMode = true;
    op.methodName = 'AddUserAsync';
    data = [this.adUser, null, false, false];
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload
            .updateFileDirectReload(res.save.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          res.save.chooseRoles = res.save?.functions;
          this.changeDetector.detectChanges();
        }
      });
    this.dialog.close();
  }

  onUpdate() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          this.imageUpload
            .updateFileDirectReload(res.update.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          res.update['chooseRoles'] = res.update?.functions;
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
        }
      });
    this.dialog.close();
  }

  onSave() {
    this.saveSuccess = true;
    this.formUser.patchValue(this.adUser);
    if (this.formUser.invalid) {
      this.adService.notifyInvalid(this.formUser, this.formModel);
      return;
    } else {
      if (this.isAddMode) {
        if (this.checkBtnAdd == false) return this.onAdd();
        else {
          if (
            this.countListViewChooseRoleApp > 0 ||
            this.countListViewChooseRoleService > 0
          ) {
            this.adService
              .addUserRole(this.dataAfterSave, this.viewChooseRole)
              .subscribe((res: any) => {
                if (res) {
                  res.chooseRoles = res?.functions;
                  (this.dialog.dataService as CRUDService)
                    .update(res)
                    .subscribe();
                  this.changeDetector.detectChanges();
                }
              });
          }
          this.dialog.close();
          this.notification.notifyCode('SYS006');
        }
      } else this.onUpdate();
    }
  }

  reloadAvatar(data: any): void {
    this.imageUpload?.reloadImageWhenUpload();
  }

  valueChangeM(data) {
    this.adUser[data.field] = data.data;
  }
  valueChangeU(data) {
    this.adUser[data.field] = data.data;
  }
  valueChangeP(data) {
    this.adUser[data.field] = data.data;
  }

  valueEmp(data) {
    this.adUser.employeeID = data.data;
    this.getEmployee(this.adUser.employeeID);
  }

  valueUG(data) {
    if (data.data) {
      this.adUser.userGroup = data.data;
      this.loadUserRole(data.data);
    }
  }

  valueBU(data) {
    if (data.data) {
      this.adUser[data.field] = data.data;
    }
  }

  getEmployee(employeeID: string) {
    this.api
      .exec<any>('ERM.Business.HR', 'HRBusiness', 'GetModelEmp', [employeeID])
      .subscribe((employee) => {
        if (employee) {
          this.adUser.employeeID = employeeID;
          this.adUser.userName = employee.employeeName;
          this.adUser.buid = employee.organizationID;
          this.adUser.email = employee.email;
          this.adUser.phone = employee.phone;
          this.changeDetector.detectChanges();
        }
      });
  }

  loadUserRole(userID) {
    if (!userID) return;
    this.api
      .call('ERM.Business.AD', 'UsersBusiness', 'GetModelListRoles', [userID])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          this.viewChooseRole = res.msgBodyData[0];
          this.viewChooseRole.forEach((dt) => {
            dt['module'] = dt.functionID;
            dt['roleID'] = dt.recIDofRole;
            dt.userID = this.adUser.userID;
          });
          this.countListViewChooseRoleApp = this.viewChooseRole.length;
          this.changeDetector.detectChanges();
        }
      });
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Phân quyền', name: 'Roles' },
  ];

  setTitle(e: any) {
    this.title = 'Thêm ' + e;
    this.changeDetector.detectChanges();
  }

  buttonClick(e: any) { }
}
