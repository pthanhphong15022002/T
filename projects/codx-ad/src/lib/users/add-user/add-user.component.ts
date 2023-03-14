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
  TemplateRef,
  Pipe,
  PipeTransform,
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
  Util,
} from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { throws } from 'assert';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AnyRecordWithTtl } from 'dns';
import { AD_Roles } from '../../models/AD_Roles.models';
import { AD_UserRoles } from '../../models/AD_UserRoles.models';
import { ContentTmp } from '../../models/contentTmp.model';
import { DomSanitizer } from '@angular/platform-browser';
import { tmpTNMD } from '../../models/tmpTenantModules.models';

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
  title = '';
  header = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  readOnly = false;
  isAddMode = true;
  user: any;
  adUser: any = {};
  adRoles: AD_Roles = new AD_Roles();
  adUserRoles: AD_UserRoles = new AD_UserRoles();
  countListViewChooseRoleApp: Number = 0;
  countListViewChooseRoleService: Number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  viewChooseRoleTemp: tmpformChooseRole[] = [];
  lstChangeModule: tmpTNMD[] = [];
  formModel: FormModel;
  formType: any;
  gridViewSetup: any = [];
  checkBtnAdd = false;
  saveSuccess = false;
  dataAfterSave: any;
  countOpenPopRoles = 0;
  formUser: FormGroup;
  checkValueChangeUG = false;
  dataUG: any = new Array();
  tmpPost: any;
  dataCopy: any;
  dataComment: any;
  contentComment: any;
  userGroupVisible: boolean = true;
  date = new Date();
  constructor(
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private auth: AuthStore,
    private adService: CodxAdService,
    private notification: NotificationsService,
    private sanitizer: DomSanitizer,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.formType = dt?.data?.formType;
    this.data = dialog.dataService!.dataSelected;
    this.dataCopy = dt?.data?.dataCopy;
    this.adUser = JSON.parse(JSON.stringify(this.data));
    if (this.formType == 'edit') {
      // this.adUser.userID = this.data._uuid;
      this.viewChooseRole = this.data?.chooseRoles;
      if (this.data?.chooseRoles)
        this.viewChooseRoleTemp = JSON.parse(
          JSON.stringify(this.data?.chooseRoles)
        );
      this.adUser['phone'] = this.adUser.mobile;
      this.countListViewChoose();
    } else if (this.formType == 'copy') {
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

  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.formType == 'edit') {
      this.isAddMode = false;
      this.adService
        .getUserGroupByID(this.adUser.userGroup)
        .subscribe((res) => {
          if (res) this.dataUG = res;
        });
    }
    this.dialog.closed.subscribe((res) => {
      if (!this.saveSuccess) {
        if (this.dataAfterSave && this.dataAfterSave.userID) {
          this.deleteUserBeforeDone(this.dataAfterSave);
        }
      }
    });
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }
  openPopup(item: any) {
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.userID.status == 'VALID' &&
      formGroup.userName.status == 'VALID' &&
      formGroup.buid.status == 'VALID' &&
      formGroup.email.status == 'VALID'
    ) {
      if (
        this.checkValueChangeUG == true ||
        (this.adUser.userGroup && this.dataUG && this.dataUG?.length > 0)
      ) {
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
            if (this.formType == 'add' || this.formType == 'copy') {
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
    } else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
  }

  openPopupRoles(item: any) {
    this.countOpenPopRoles++;
    if (this.formType == 'add' || this.formType == 'copy') {
      if (this.countOpenPopRoles == 1) this.addUserTemp();
    }
    var option = new DialogModel();
    option.FormModel = this.form.formModel;
    var obj = {
      formType: this.formType,
      data: item,
      userID: this.adUser.userID,
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
        this.lstChangeModule = e.event[1];
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
    var formGroup = this.form.formGroup.controls;
    if (!this.adUser.buid) formGroup.buid.setValue(null);
    if (
      formGroup.userID.status == 'VALID' &&
      formGroup.userName.status == 'VALID' &&
      formGroup.buid.status == 'VALID' &&
      formGroup.email.status == 'VALID'
    ) {
      this.dialog.dataService
        .save((opt: any) => this.beforeSaveTemp(opt), 0, '', '', false)
        .subscribe((res) => {
          if (res.save) {
            this.adUser.userID = res.save.userID;

            this.getHTMLFirstPost(this.adUser);
            this.adService.createFirstPost(this.tmpPost).subscribe();
            this.imageUpload
              .updateFileDirectReload(res.save.userID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
              });
            this.dataAfterSave = res.save;
            console.log('check dataAfterSave', this.dataAfterSave);
          }
        });
    } else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
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
    if (this.formType == 'add' || this.formType == 'copy') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      if (this.formType == 'copy') {
        this.viewChooseRole.map((dt) => {
          dt.userID = this.adUser.userID;
        });
      }
      this.adUser;

      data = [
        this.adUser,
        this.viewChooseRole,
        true,
        false,
        false,
        this.lstChangeModule,
        this.saveSuccess,
      ];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      data = [
        this.adUser,
        this.viewChooseRole,
        checkDifference,
        '0',
        this.lstChangeModule,
      ];
    }
    op.data = data;
    return true;
  }

  beforeSaveTemp(op: RequestOption) {
    var data = [];
    this.isAddMode = true;
    op.methodName = 'AddUserAsync';
    data = [
      this.adUser,
      this.viewChooseRole,
      false,
      false,
      false,
      this.lstChangeModule,
      this.saveSuccess,
    ];
    op.data = data;
    return true;
  }

  updateAfterAdd() {
    var checkDifference =
      JSON.stringify(this.viewChooseRoleTemp) ===
      JSON.stringify(this.viewChooseRole);
    this.api
      .execSv('SYS', 'ERM.Business.AD', 'UsersBusiness', 'UpdateUserAsync', [
        this.adUser,
        this.viewChooseRole,
        checkDifference,
      ])
      .subscribe();
  }

  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.save) {
          this.getHTMLFirstPost(this.adUser);
          this.adService.createFirstPost(this.tmpPost).subscribe((res) => {});
          this.imageUpload
            .updateFileDirectReload(res.save.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
              this.dialog.close(res.save);
            });
          res.save.chooseRoles = res.save?.functions;
          (this.dialog.dataService as CRUDService).update(res.save).subscribe();
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
                debugger
                if (result) {
                  this.loadData.emit();
                }
                this.dialog.close(res.update);
              });
          }
          res.update.chooseRoles = res.update.functions;
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.changeDetector.detectChanges();
        }
      });
  }

  onSave() {
    this.saveSuccess = true;
    var formGroup = this.form.formGroup.controls;
    if (!this.adUser.buid) formGroup.buid.setValue(null);
    if (
      formGroup.userID.status == 'VALID' &&
      formGroup.userName.status == 'VALID' &&
      formGroup.buid.status == 'VALID' &&
      formGroup.email.status == 'VALID'
    ) {
      if (this.isAddMode) {
        if (this.checkBtnAdd == false) {
          this.onAdd();
        } else {
          this.updateAfterAdd();
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
                  this.dialog.close(res);
                  this.changeDetector.detectChanges();
                }
              });
          }
          // this.notification.notifyCode('SYS006');
        }
      } else this.onUpdate();
    } else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
  }

  src = '';
  url: any =
    '<img src="/assets/themes/sys/default/img/Avatar_Default.svg" class="w-40px" alt="">';
  htmlHaveUrl = '<img class="w-40px" src="{0}" alt="">';
  getHTMLFirstPost(data) {
    this.src = this.imageUpload.data?.url;
    this.dataComment = data;
    var viewRef = this.firstComment.createEmbeddedView({ $implicit: '' });
    viewRef.detectChanges();
    let contentDialog = viewRef.rootNodes;
    let html = contentDialog[1] as HTMLElement;
    /*Binding dữ liệu vào html*/
    var urlTemp = '';
    if (this.src) {
      urlTemp = Util.stringFormat(this.htmlHaveUrl, this.src);
      this.url = this.sanitizer.bypassSecurityTrustHtml(urlTemp);
      this.url = this.url.changingThisBreaksApplicationSecurity;
    }
    var positionName = '';
    if (this.dataComment?.positionName)
      positionName = this.dataComment.positionName;
    let HTMLParse = Util.stringFormat(
      html.innerHTML,
      this.url,
      this.dataComment.userName,
      positionName
    );
    /*Binding dữ liệu vào html*/
    this.tmpPost = {
      content: HTMLParse,
      approveControl: '0',
      category: '1',
      shareControl: '9',
      listTag: [],
      createdOn: new Date(),
      createdBy: 'CODXADMIN',
      createdName: 'CoDX Administrator',
    };
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
            buid: this.adUser.buid,
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
