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
  checkValueChangeUG = false;
  dataUG: any = new Array();
  comments: any;
  tmpPost: any;

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
    this.adUser = JSON.parse(JSON.stringify(this.data));
    if (this.formType == 'edit') {
      this.viewChooseRole = this.data?.chooseRoles;
      this.viewChooseRoleTemp = JSON.parse(
        JSON.stringify(this.data?.chooseRoles)
      );
      this.adUser['phone'] = this.adUser.mobile;
      this.countListViewChoose();
    } else this.adUser.buid = '';
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
      this.adService
        .getUserGroupByID(this.adUser.userGroup)
        .subscribe((res) => {
          if (res) this.dataUG = res;
        });
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
          this.deleteUserBeforeDone(this.dataAfterSave);
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
    this.formUser.patchValue(this.adUser);
    if (this.formUser.invalid) {
      this.adService.notifyInvalid(this.formUser, this.formModel);
      return;
    } else {
      if (this.checkValueChangeUG == true || this.adUser.userGroup) {
        this.dataUG.forEach((dt) => {
          var userID = '';
          var userName = '';
          if (this.formType == 'edit') {
            userID = dt.userID;
            userName = dt.userName;
          } else {
            userID = dt.UserID;
            userName = dt.UserName;
          }
          if (userID == this.adUser.userGroup) {
            if (this.formType == 'add') {
              this.notification
                .alertCode('AD003', null, "'" + userName + "'")
                .subscribe((info) => {
                  if (info.event.status == 'Y') {
                    this.adUser.customize = true;
                    this.openPopupRoles(item);
                  }
                });
            } else {
              if (this.adUser.customize == false) {
                this.notification
                  .alertCode('AD003', null, "'" + userName + "'")
                  .subscribe((info) => {
                    if (info.event.status == 'Y') {
                      this.adUser.customize = true;
                      this.openPopupRoles(item);
                    }
                  });
              } else this.openPopupRoles(item);
            }
          }
        });
      } else this.openPopupRoles(item);
    }
  }

  openPopupRoles(item: any) {
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
  }

  deleteUserBeforeDone(data: any) {
    this.adService.deleteUser(data.userID, data.employeeID).subscribe();
    this.dialog.dataService.data = this.dialog.dataService.data.filter(
      (x) => x.userID != data.userID
    );
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
      data = [this.adUser, this.viewChooseRole, true, false];
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
              this.dialog.close(res?.save);
            });
          res.save.chooseRoles = res.save?.functions;
          this.changeDetector.detectChanges();
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          if (this.imageUpload) {
            this.imageUpload
              .updateFileDirectReload(res.update.userID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
                this.dialog.close(res.update);
              });
          }
          res.update.chooseRoles = res.update.functions;
          // (this.dialog.dataService as CRUDService)
          //   .update(res.update)
          //   .subscribe();
          this.dialog.close();
          this.changeDetector.detectChanges();
        }
      });
  }

  onSave() {
    this.saveSuccess = true;
    this.formUser.patchValue(this.adUser);
    if (this.formUser.invalid) {
      this.adService.notifyInvalid(this.formUser, this.formModel);
      return;
    } else {
      if (this.isAddMode) {
        if (this.checkBtnAdd == false) {
          this.onAdd();
        } else {
          if (
            this.countListViewChooseRoleApp > 0 ||
            this.countListViewChooseRoleService > 0
          ) {
            this.adService
              .addUserRole(this.dataAfterSave, this.viewChooseRole)
              .subscribe((res: any) => {
                if (res) {
                  res.chooseRoles = res?.functions;
                  this.dialog.close(res);
                  /* (this.dialog.dataService as CRUDService)
                    .update(res)
                    .subscribe(); */
                  this.changeDetector.detectChanges();
                }
              });
          }
          this.notification.notifyCode('SYS006');
        }
        this.getHTMLFirstPost(this.adUser);
        this.adService.createFirstPost(this.tmpPost).subscribe();
      } else this.onUpdate();
    }
  }

  getHTMLFirstPost(data) {
    this.comments = `<div class="card border rounded-4 border">
    <!--begin::Body-->
    <div class="card-body d-flex">
      <!--begin::Wrapper-->
      <div class="d-flex flex-column w-350px me-4">
        <a href="/" class="mb-2">
          <img alt="Logo" class="h-15px " src="assets/themes/wp/default/img/WP.svg">
        </a>
        <h4 class="fw-bolder text-primary">Chào mừng thành viên mới</h4>
        <div class="mb-4">Rất hân hạnh chào đón bạn đến với chúng tôi. Chúng tôi tin rằng với khả năng và nhiệt huyết
          của mình, bạn sẽ là một nhân tố giúp công ty ngày càng phát triển hơn. </div>
        <!--begin::user center-->
        <div class="d-flex align-items-center flex-center  py-2 px-6">
          <div class="symbol symbol-40px symbol-circle me-4">
            <codx-img #image objectId="ADMIN"></codx-img>
          </div>
          <div class="d-flex flex-column w-100">
            <div class="text-dark fw-bold fs-5">${data.userName}</div>
            <div class="text-gray-400">${
              data.positionName ? data.positionName : ''
            }</div>
          </div>
        </div>
        <!--end::user center-->
      </div>
      <!--begin::Wrapper-->
      <!--begin::Illustration-->
      <img src="/assets/themes/sys/default/img/Welcome.svg" class="position-absolute me-3  end-0 h-175px" alt="">
      <!--end::Illustration-->
    </div>
    <!--end::Body-->
  </div>`;

    /*Init first post*/
    // var permissions = [
    //   {
    //     memberType: '1',
    //     objectType: '1',
    //     objectID: 'ADMIN',
    //     objectName: 'Lê Phạm Hoài Thương',
    //     full: true,
    //     read: true,
    //     write: true,
    //     update: true,
    //     delete: true,
    //     assign: true,
    //     share: true,
    //     upload: true,
    //     download: true,
    //     isActive: true,
    //   },
    //   {
    //     memberType: '2',
    //     objectType: '7',
    //     read: true,
    //     share: true,
    //     isActive: true,
    //   },
    //   {
    //     memberType: '2',
    //     objectType: '9',
    //     read: true,
    //     share: true,
    //     isActive: true,
    //   },
    // ];
    this.tmpPost = {
      content: this.comments,
      approveControl: '0',
      category: '1',
      shareControl: '9',
      listTag: [],
    };
    /*Init first post*/
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
    if (data.data) {
      this.adUser.employeeID = data.data;
      this.getEmployee(this.adUser.employeeID);
    }
  }

  valueUG(data) {
    if (data?.component) {
      this.dataUG = data?.component.dataService.data;
    }
    if (data.data) {
      this.checkValueChangeUG = true;
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
          if (this.formType == 'add') {
            this.adUser.email = employee.email;
            this.adUser.phone = employee.phone;
          } else this.adUser['phone'] = this.adUser.mobile;
          this.changeDetector.detectChanges();
        }
      });
  }

  loadUserRole(userID) {
    if (!userID) return;
    this.api
      .call('ERM.Business.AD', 'UsersBusiness', 'GetModelListRolesAsync', [
        userID,
      ])
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
}
