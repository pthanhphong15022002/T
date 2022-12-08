import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  TenantStore,
  UIComponent,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { AD_Roles } from '../../models/AD_Roles.models';
import { RolesService } from '../services/roles.service';
import { TempService } from '../services/temp.service';

declare var $: any;
@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RoleEditComponent
  extends UIComponent
  implements OnInit, OnDestroy
{
  data: any = {};
  form = '';
  tenant = '';
  saveas: string;
  isNew: true;
  date = new Date();
  header = 'Thêm mới';
  dialog: DialogRef;
  readOnly = false;
  roles: AD_Roles = new AD_Roles();
  formType = '';
  dataUpdate: AD_Roles = new AD_Roles();
  urlDetailRoles = '';
  gridViewSetup: any = [];
  empty = '';
  roleID = '';

  @Input() modelPage: any;

  constructor(
    private injector: Injector,
    private tenantStore: TenantStore,
    private notificationsService: NotificationsService,
    private tempService: TempService,
    private changedr: ChangeDetectorRef,
    private roleService: RolesService,
    private adsv: CodxAdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.tenant = this.tenantStore.get()?.tenant;
    this.data = dialog.dataService!.dataSelected;
    this.cache
      .moreFunction(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        this.urlDetailRoles = res[0]?.url;
      });
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) this.gridViewSetup = res;
      });
    if (dt && dt.data) {
      this.formType = dt.data.formType;
      this.roleID = this.data?.recID;
      this.header = dt.data.headerText;
      this.tempService.roleName.next(this.data?.roleName);
      //this.tempService.roleName = roleName;
    }
  }

  ngOnDestroy(): void {}

  onInit(): void {}

  ngAfterViewInit() {
    console.log(this.gridViewSetup);
  }

  redirectPagePermissions() {
    this.dialog.close();
    this.codxService.navigate('', this.urlDetailRoles, { recID: this.roleID });
  }
  viewRoleDetail() {
    // if (this.saveas == "0") {
    //   // Chỉnh sửa
    //   this.redirectPagePermissions();
    //   return;
    // }
    // if (this.saveas == "2") {
    //   // Copy

    //   //TEMP
    //   // this.confirmAfterSave("AD001", true);
    //   //TEMP
    // } else {
    //   // lúc thêm mới bình thường
    //   this.SaveRole(true, false);
    // }

    this.redirectPagePermissions();
  }

  clickBtnSave() {
    // if (this.saveas == "2") {
    //   // Copy
    //   this.confirmAfterSave("AD002", false);
    // } else {
    //   this.SaveRole(true, false, false);
    // }

    if (this.formType == 'edit' || this.formType == 'add') this.SaveRole(true);
    else {
      this.SaveRole(false);
    }
  }
  SaveRole(isCopyPermision: boolean) {
    //var listview = this.adsv.listview;
    this.api
      .call('ERM.Business.AD', 'RolesBusiness', 'SaveRoleAsync', [
        this.data,
        this.formType,
        isCopyPermision,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          this.dialog.close();
        } else {
          this.notificationsService.notifyCode('SYS020');
        }
      });
  }

  closeEdit(): void {}

  valueChange(e) {
    if (e) {
      var field = e.field;
      var data = e.data;
      if (field) {
        if (field == 'modules' && data.value)
          this.data[field] = Array.isArray(data.value)
            ? data.value.join(';')
            : data.value;
        else this.data[field] = data;
      }
    }
  }
}
