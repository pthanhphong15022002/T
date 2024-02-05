import { CodxAdService } from './../../codx-ad.service';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  Output,
  EventEmitter,
  Injector,
  TemplateRef,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  AuthStore,
  ImageViewerComponent,
  FormModel,
  RequestOption,
  UIComponent,
  DialogModel,
  NotificationsService,
  LayoutAddComponent,
  Util,
  CodxFormComponent,
  CodxComboboxComponent,
  CodxInputComponent,
} from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { FormGroup } from '@angular/forms';
import { AD_Roles } from '../../models/AD_Roles.models';
import { AD_UserRoles } from '../../models/AD_UserRoles.models';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent extends UIComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;
  @ViewChild('form') form: LayoutAddComponent;
  @Output() loadData = new EventEmitter();
  @ViewChild('firstComment') firstComment: TemplateRef<any>;
  @ViewChild('userGroup') userGroup?: CodxInputComponent;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  title = '';
  header = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  readOnly = false;
  // isAddMode = true;
  user: any;
  adUser: any = {};
  adRoles: AD_Roles = new AD_Roles();
  adUserRoles: AD_UserRoles = new AD_UserRoles();
  countListViewChooseRoleApp: number = 0;
  countListViewChooseRoleService: number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  viewChooseRoleTemp: tmpformChooseRole[] = [];
  formModel: FormModel;
  formType: any;
  gridViewSetup: any = [];
  isSaved = false;
  isSaving = false;
  dataAfterSave: any;
  countOpenPopRoles = 0;
  formUser: FormGroup;
  checkValueChangeUG = false;
  dataUG: any = new Array();
  tmpPost: any = null;
  dataCopy: any;
  dataComment: any;
  contentComment: any;
  userGroupVisible: boolean = true;
  date = new Date();
  //employeeID first change
  isEmpIDNotNull: boolean = false;
  isSaas = false;
  unWelcomeUser: any;
  constructor(
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private auth: AuthStore,
    private adService: CodxAdService,
    private codxShareService: CodxShareService,
    private notification: NotificationsService,
    private sanitizer: DomSanitizer,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.isSaas = environment.saas == 1;
    this.formType = dt?.data?.formType;
    this.adUser = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dataCopy = dt?.data?.dataCopy;
    this.funcID = dt?.data?.funcID;
    if (this.formType == 'invite') {
      this.isSaved = false;
      this.adUser.administrator = false;
      this.adUser['phone'] = this.adUser.mobile;
      this.countListViewChoose();
    } else if (this.formType == 'edit') {
      this.isSaved = true;
      this.viewChooseRole = this.adUser?.chooseRoles;
      if (this.adUser?.chooseRoles)
        this.viewChooseRoleTemp = JSON.parse(
          JSON.stringify(this.adUser?.chooseRoles)
        );
      this.adUser['phone'] = this.adUser.mobile;
      this.countListViewChoose();
    } else if (this.formType == 'view') {
      this.isSaved = true;
      this.isSaving = true;
      this.adUser.chooseRoles = this.viewChooseRole;
      if (this.adUser?.chooseRoles)
        this.viewChooseRoleTemp = JSON.parse(
          JSON.stringify(this.adUser?.chooseRoles)
        );
      this.countListViewChoose();
    } else if (this.formType == 'copy') {
      this.isSaved = false;

      if (this.dataCopy)
        this.adUser = JSON.parse(JSON.stringify(this.dataCopy));
      this.adUser.phone = '';
      this.adUser.email = '';
      this.adUser.employeeID = null;
      this.adUser.buid = null;
      this.adUser.userName = '';
      if (this.dataCopy?.chooseRoles) {
        this.viewChooseRole = this.dataCopy?.chooseRoles;
        this.viewChooseRoleTemp = JSON.parse(
          JSON.stringify(this.dataCopy?.chooseRoles)
        );
        this.countListViewChoose();
      }
    } else {
      this.isSaved = false;
      this.adUser.buid = null;
      this.adUser.employeeID = null;
      if (dt?.data?.email) this.adUser.email = dt?.data?.email;
    }
    this.dialog = dialog;
    this.user = auth.get();

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
          this.userGroupVisible = res.UserGroup.isVisible;
        }
      });
    this.cache.message('WP028').subscribe((res) => {
      if (res) {
        this.contentComment = res.defaultName;
      }
    });
    this.title = dt.data?.headerText;
  }

  onInit(): void {
    if (this.adUser.employeeID) {
      this.isEmpIDNotNull = true;
    } else {
      this.isEmpIDNotNull = false;
    }
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
    this.form.form.onAfterInit.subscribe((res) => {
      this.setValidateForm();
    });
  }

  setValidateForm() {
    let rAccountID = true;
    let lsRequire: any = [];
    if ((this.form.form as CodxFormComponent).data?._keyAuto == 'UserID')
      rAccountID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({
      field: 'UserID',
      isDisable: false,
      require: rAccountID,
    });
    (this.form.form as CodxFormComponent).setRequire(lsRequire);
  }

  openRoles(item: any) {
    if (this.form.formGroup.valid) {
      this.dataUG = this.userGroup.ComponentCurrent.dataService.data;
      if (
        this.checkValueChangeUG == true ||
        (this.adUser.userGroup && this.dataUG && this.dataUG?.length > 0)
      ) {
        let group = this.dataUG.find((x) => x.GroupID == this.adUser.userGroup);
        if (group) {
          if (this.formType == 'add' || this.formType == 'copy') {
            return this.notification
              .alertCode('AD003', null, "'" + group.GroupName + "'")
              .subscribe((info) => {
                if (info.event?.status && info.event?.status == 'Y') {
                  this.adUser.customize = true;
                  this.beforeOpenPopupRoles(item);
                }
              });
          }
          if (this.adUser.customize == false) {
            return this.notification
              .alertCode('AD003', null, "'" + group.GroupName + "'")
              .subscribe((info) => {
                if (info.event?.status && info.event?.status == 'Y') {
                  this.adUser.customize = true;
                  this.beforeOpenPopupRoles(item);
                }
              });
          }
        }
      }
      return this.beforeOpenPopupRoles(item);
    } else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
  }

  beforeOpenPopupRoles(item: any) {
    this.countOpenPopRoles++;

    if (!this.isSaved) {
      // if (this.countOpenPopRoles == 1) this.addUserTemp();
      this.saveUser('addUserRoles', false, item);
    } else {
      this.openPopupRoles(item);
    }
  }

  openPopupRoles(item) {
    let option = new DialogModel();
    option.FormModel = this.form.formModel;
    let obj = {
      formType: this.formType,
      data: item,
      groupID: '',
      lstMemIDs: [this.adUser.userID],
      needValidate: true,
      autoCreated: false,
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
        this.viewChooseRole = e?.event[0];
        // this.lstChangeModule = e.event[1];
        this.countListViewChoose();
        this.viewChooseRole.forEach((dt) => {
          dt['module'] = dt.functionID;
          dt['roleID'] = dt.roleID;
          dt.userID = this.adUser.userID;
        });
        this.adUser.chooseRoles = this.viewChooseRole;
        this.dialog.dataService.idField = 'userID';
        this.dialog.dataService.update(this.adUser).subscribe();
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

  avatarChange = false;
  changeAvatar() {
    //luu user roi
    this.avatarChange = true;
  }

  beforeSave(opt: RequestOption) {
    this.isSaving = true;
    opt.methodName = 'AddUpdateUserAsync';
    opt.data = [this.adUser, !this.isSaved, this.formType];
    return true;
  }

  saveUser(
    // closeAddPopup: boolean,
    mode: string = 'addToGroup' ||
      'addUserRoles' ||
      'changeAvatar' ||
      'closePopup',
    isOverrideRoles: boolean,
    item?: any
  ) {
    if (this.form.formGroup.valid) {
      this.dialog.dataService
        .save(
          (opt: any) => this.beforeSave(opt),
          0,
          '',
          '',
          mode === 'addUserRoles' ? false : true
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res) {
            if (!this.isSaved) {
              if (this.unWelcomeUser == null) {
                this.codxShareService
                  .getSettingValueWithOption('F', 'WPParameters', null, '1')
                  .subscribe((settings) => {
                    if (settings?.length > 0 && settings[0]?.dataValue) {
                      let wpSetting = JSON.parse(settings[0]?.dataValue);
                      if (wpSetting) {
                        this.unWelcomeUser =
                          wpSetting?.UnWelcomeUser == '1' ? false : true;
                        this.welcomeUserPost();
                      }
                    }
                  });
              } else {
                this.welcomeUserPost();
              }
              if (res.save) {
                this.dataAfterSave = res.save;
                this.adUser.userID = res.save.userID;
                this.adUser.status = res.save.status;
              } else if (res.update) {
                this.dataAfterSave = res.update;
                this.adUser.userID = res.update.userID;
                this.adUser.status = res.update.status;
              }
            }
            this.isSaved = true;

            switch (mode) {
              case 'closePopup': {
                if (this.avatarChange) {
                  this.imageUpload
                    .updateFileDirectReload(this.adUser.userID)
                    .subscribe((result) => {
                      if (result) {
                        this.dialog.close({
                          user: this.adUser,
                          type: 'changedAvatar',
                        });
                      }
                    });
                } else this.dialog.close({ user: this.adUser, type: '' });
                break;
              }
              case 'addToGroup': {
                this.addUserToGroup(this.adUser.userGroup, isOverrideRoles);
                break;
              }
              case 'addUserRoles': {
                this.openPopupRoles(item);
                break;
              }
              default: {
                break;
              }
            }
          }

          this.isSaving = false;
        });
    }
  }

  src = '';
  url: any =
    '<img src="/assets/themes/sys/default/img/Avatar_Default.svg" class="w-40px" alt="">';
  htmlHaveUrl = '<img class="w-40px" src="{0}" alt="">';
  getHTMLFirstPost(data) {
    this.src = this.imageUpload.data?.url;
    this.dataComment = data;
    let viewRef = this.firstComment.createEmbeddedView({ $implicit: '' });
    viewRef.detectChanges();
    let contentDialog = viewRef.rootNodes;
    let html = contentDialog[1] as HTMLElement;
    /*Binding dữ liệu vào html*/
    let urlTemp = '';
    if (this.src) {
      urlTemp = Util.stringFormat(this.htmlHaveUrl, this.src);
      this.url = this.sanitizer.bypassSecurityTrustHtml(urlTemp);
      this.url = this.url.changingThisBreaksApplicationSecurity;
    }
    let positionName = '';
    if (this.dataComment?.positionName)
      positionName = this.dataComment.positionName;
    let HTMLParse = Util.stringFormat(
      html.innerHTML,
      this.url,
      this.dataComment.userName,
      positionName
    );
    /*Binding dữ liệu vào html*/
    let permission = {
      memberType: '2',
      objectID: '',
      objectName: '',
      objectType: '9',
    };
    let lstPermission = [];
    lstPermission.push(permission);
    this.tmpPost = {
      contents: HTMLParse,
      category: '1',
      shareControl: '9',
      attachments: 0,
      medias: 0,
      createdOn: new Date(),
      createdBy: 'CODXADMIN',
      createdName: 'CoDX Administrator',
      permissions: lstPermission,
    };
  }

  welcomeUserPost() {
    if (this.unWelcomeUser) {
      this.getHTMLFirstPost(this.adUser);
      this.adService.createFirstPost(this.tmpPost).subscribe();
    }
  }
  reloadAvatar(data: any): void {
    this.imageUpload?.reloadImageWhenUpload();
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

      let isOverrideRoles = true;
      if (this.isSaved) {
        this.addUserToGroup(data.data, isOverrideRoles);
      } else {
        this.saveUser('addToGroup', true, isOverrideRoles);
      }
    }
  }

  addUserToGroup(groupID, isOverrideRoles: boolean) {
    if (groupID && groupID != '') {
      this.adService
        .addUserToGroupAsync(groupID, this.adUser.userID, isOverrideRoles)
        .subscribe((newRoles: tmpformChooseRole[]) => {
          this.viewChooseRole = newRoles;
          this.viewChooseRole.forEach((dt) => {
            dt['module'] = dt.functionID;
            dt['roleID'] = dt.roleID;
            dt.userID = this.adUser.userID;
          });
          this.adUser.chooseRoles = this.viewChooseRole;
          this.countListViewChooseRoleApp = this.viewChooseRole.length;
          this.changeDetector.detectChanges();
        });
    }
  }

  valueBU(data) {
    if (data.data) {
      this.adUser[data.field] = data.data;
      this.adUser.buName = data?.component?.itemsSelected[0]?.BUName;
    }
  }

  getEmployee(employeeID: string) {
    this.api
      .exec<any>('ERM.Business.HR', 'HRBusiness', 'GetModelEmp', [employeeID])
      .subscribe((employee) => {
        if (employee) {
          // this.adUser.employeeID = employeeID;
          this.adUser.userName = employee.employeeName;
          this.adUser.buid = employee.organizationID;
          this.adUser['positionName'] = employee.positionName;
          if (this.formType == 'add' || this.formType == 'copy') {
            this.adUser.phone = employee.phone;
          } else this.adUser['phone'] = this.adUser.mobile;
          this.form.formGroup.patchValue({
            // employeeID: this.adUser.employeeID,
            userName: this.adUser.userName,
            // buid: this.adUser.buid,
            mobile: this.adUser.phone,
          });
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
            dt['roleID'] = dt.roleID;
            dt.userID = this.adUser.userID;
          });
          this.adUser.chooseRoles = this.viewChooseRole;
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
