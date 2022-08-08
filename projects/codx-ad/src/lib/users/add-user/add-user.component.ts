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
} from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { throws } from 'assert';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { FormGroup } from '@angular/forms';
import { AnyRecordWithTtl } from 'dns';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent extends UIComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  @ViewChild('view') codxView!: any;

  title = 'Thêm người dùng';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  readOnly = false;
  isAddMode = true;
  user: any;
  adUser = new AD_User();
  countListViewChooseRoleApp: Number = 0;
  countListViewChooseRoleService: Number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  formModel: FormModel;
  formType: any;
  email: any = '';
  userName: any = '';
  mobile: any = '';
  employeeID: any = '';

  constructor(
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private auth: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.formType = dt?.data.type;
    this.data = dialog.dataService!.dataSelected;
    this.adUser = JSON.parse(JSON.stringify(this.data));
    debugger;
    this.dialog = dialog;
    this.user = auth.get();
  }

  onInit(): void {
    if (this.formType == 'edit') this.title = 'Cập nhật người dùng';
    this.isAddMode = false;
  }

  openPopup(item: any) {
    this.dialogRole = this.callfc.openForm(
      PopRolesComponent,
      '',
      1200,
      700,
      '',
      item
    );
    this.dialogRole.closed.subscribe((e) => {
      if (e?.event) {
        this.viewChooseRole = e?.event;
        this.countListViewChooseRoleApp = this.viewChooseRole.filter(
          (obj) => obj.isPortal == false
        ).length;
        this.countListViewChooseRoleService = this.viewChooseRole.filter(
          (obj) => obj.isPortal == true
        ).length;
        this.changeDetector.detectChanges();
      }
    });
  }

  beforeSave(op: RequestOption) {
    var data = [];
    if (this.formType == 'add') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      data = [this.adUser, this.isAddMode];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      data = [this.adUser, this.isAddMode];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload
            .updateFileDirectReload(res.save.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          this.changeDetector.detectChanges();
        }
      });
    this.closePanel();
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
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.changeDetector.detectChanges();
        }
      });
    this.closePanel();
  }

  onSave() {
    if (this.isAddMode) return this.onAdd();
    return this.onUpdate();
  }

  reloadAvatar(data: any): void {
    this.imageUpload?.reloadImageWhenUpload();
  }

  closePanel() {
    this.dialog.close();
    //this.viewBase.currentView.closeSidebarRight();
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
    this.employeeID = data.data;
    this.getEmployee(this.employeeID);
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
        debugger;
        if (employee) {
          this.adUser.employeeID = employeeID;
          this.adUser.userName = employee.employeeName;
          // this.adUser.positionID = employee.positionID,
          this.adUser.buid = employee.organizationID;
          this.adUser.email = employee.email;
          this.adUser.mobile = employee.phone;
          this.adUser = { ...this.adUser };
          this.email = employee.email;
          this.mobile = employee.phone;
          this.user = employee.employeeName;
        }
      });
  }

  loadUserRole(userID) {
    if (!userID) return;
    this.api
      .call('ERM.Business.AD', 'UsersBusiness', 'GetModelListRoles', [userID])
      .subscribe((res) => {
        if (res && res.msgBodyData) {
          this.viewChooseRole = res.msgBodyData[0];
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

  buttonClick(e: any) {}

  // getFormGroup(formName, gridView): Promise<FormGroup> {
  //   return new Promise<FormGroup>((resolve, reject) => {
  //     this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
  //       var model = {};
  //       if (gv) {
  //         const user = this.auth.get();
  //         for (const key in gv) {
  //           var b = false;
  //           if (Object.prototype.hasOwnProperty.call(gv, key)) {
  //             const element = gv[key];
  //             element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
  //             model[element.fieldName] = [];

  //             if (element.fieldName == "owner") {
  //               model[element.fieldName].push(user.userID);
  //             }
  //             if (element.fieldName == "createdOn") {
  //               model[element.fieldName].push(new Date());
  //             }
  //             else if (element.fieldName == "stop") {
  //               model[element.fieldName].push(false);
  //             }
  //             else if (element.fieldName == "orgUnitID") {
  //               model[element.fieldName].push(user['buid']);
  //             }
  //             else if (element.dataType == "Decimal" || element.dataType == "Int") {
  //               model[element.fieldName].push(0);
  //             }
  //             else if (element.dataType == "Bool" || element.dataType == "Boolean")
  //               model[element.fieldName].push(false);
  //             else if (element.fieldName == "createdBy") {
  //               model[element.fieldName].push(user.userID);
  //             } else {
  //               model[element.fieldName].push(null);
  //             }
  //           }
  //         }
  //       }
  //       resolve(this.fb.group(model, { updateOn: 'blur' }));
  //     });
  //   });
  // }
}
