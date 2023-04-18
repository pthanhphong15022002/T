import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  CodxFormComponent,
  CacheService,
  AuthStore,
  UserModel,
  UIComponent,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxAdService } from '../../codx-ad.service';
import { AD_Roles } from '../../models/AD_Roles.models';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { Observable, map, of } from 'rxjs';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css'],
})
export class PopRolesComponent extends UIComponent {
  choose1: tmpformChooseRole[] = [];
  choose = new tmpformChooseRole();
  data: any;
  dialogSecond: any;
  dataView: any;
  title = 'Phân quyền người dùng';
  countService: number = 0;
  countApp: number = 0;
  lstFunc = [];
  lstEmp = [];
  listRestore = [];
  listChooseRole: tmpformChooseRole[] = [];
  // listChooseRole:tmpformChooseRole[] =[];
  idClickFunc: any;
  listRoles: AD_Roles[] = [];
  optionFirst = 'ADC01'; // Check unselect from list
  optionSecond = 'ADC02'; // Check list is null
  optionThird = 'ADC03'; // Check select from list
  checkApp = false;
  checkService = true;
  formType = '';
  isCheck = true;
  checkRoleIDNull = false;
  userID: any;
  // lstChangeFunc: tmpTNMD[] = [];
  runAfter = 3000;

  quantity = 0;
  // isUserGroup = false;
  lstUserIDs: string[] = [];
  needValidate = true;

  user: UserModel;
  ermSysTenant = ['', 'default'];
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private inject: Injector,
    private notiService: NotificationsService,
    private adService: CodxAdService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialogSecond = dialog;
    this.data = dt?.data.data;
    this.formType = dt?.data.formType;
    this.lstUserIDs = dt?.data?.lstMemIDs;
    this.needValidate = dt?.data?.needValidate;
    console.log('lst uid', this.lstUserIDs);

    this.user = authStore.get();
  }
  onInit(): void {
    if (this.data?.length > 0) {
      // this.lstChangeFunc = [];
      this.listChooseRole = JSON.parse(JSON.stringify(this.data));
    }
    this.loadData();
  }

  ngAfterViewInit() {}

  loadData() {
    this.adService.getListAppByUserRoles(this.choose1).subscribe((res) => {
      if (res) {
        this.lstFunc = res[0];
        this.listRoles = res[1];
        this.lstEmp = res[2];

        this.getListLoadDataApp();
        this.getListLoadDataService();
        this.detectorRef.detectChanges();
      }
    });

    this.detectorRef.detectChanges();
  }

  getListLoadDataApp() {
    for (let i = 0; i < this.lstFunc.length; i++) {
      if (this.lstFunc[i].roleID != null) {
        this.lstFunc[i].roleID = null;
      }
    }
    if (this.listChooseRole.length > 0) {
      for (let i = 0; i < this.lstFunc.length; i++) {
        for (let j = 0; j < this.listChooseRole.length; j++) {
          if (
            this.listChooseRole[j].functionID === this.lstFunc[i].functionID
          ) {
            this.lstFunc[i].ischeck = true;
            this.lstFunc[i].roleID = this.listChooseRole[j].roleID;
            this.countApp++;
          }
        }
      }
    }
  }
  getListLoadDataService() {
    for (let i = 0; i < this.lstEmp.length; i++) {
      if (this.lstEmp[i].roleID != null) {
        this.lstEmp[i].roleID = null;
      }
    }
    if (this.listChooseRole.length > 0) {
      for (let i = 0; i < this.lstEmp.length; i++) {
        for (let j = 0; j < this.listChooseRole.length; j++) {
          if (this.listChooseRole[j].functionID === this.lstEmp[i].functionID) {
            this.lstEmp[i].ischeck = true;
            this.lstEmp[i].roleID = this.listChooseRole[j].roleID;
            this.countService++;
          }
        }
      }
    }
  }

  lstNeedAddRoles: tmpformChooseRole[] = [];
  addRolesTimeOutID = '';
  addRoles(): Observable<boolean> {
    if (
      this.lstNeedAddRoles.length > 0 &&
      environment.saas == 1 &&
      !this.ermSysTenant.includes(this.user.tenant)
    ) {
      return this.adService
        .addUpdateAD_UserRoles(
          this.lstNeedAddRoles,
          this.lstUserIDs,
          this.needValidate
        )
        .pipe(
          map((lstAddedRoles: tmpformChooseRole[]) => {
            if (lstAddedRoles) {
              this.lstNeedAddRoles = this.lstNeedAddRoles.filter(
                (role) =>
                  !lstAddedRoles.find(
                    (addedRole) =>
                      addedRole.module == role.module &&
                      addedRole.roleID == role.roleID
                  )
              );
              return true;
            } else {
              return false;
            }
          })
        );
    } else {
      return of(true);
    }
  }

  lstNeedRemoveRoles: tmpformChooseRole[] = [];
  removeRolesTimeOutID = '';

  removeRoles() {
    if (this.lstNeedRemoveRoles.length > 0) {
      this.adService
        .removeAD_UserRoles(this.lstNeedRemoveRoles, this.lstUserIDs)
        .subscribe((lstRemovedRoles: tmpformChooseRole[]) => {
          this.lstNeedRemoveRoles = lstRemovedRoles.filter((role) => {
            return !lstRemovedRoles.includes(role);
          });
          console.log('after Remove', this.lstNeedRemoveRoles);
        });
    }
  }

  onChange(event, item?: any) {
    if (item.ischeck) {
      event.target.checked = true;
    } else {
      event.target.checked = false;
    }
    if (!item.isPortal) {
      if (event.target.checked === false) {
        item.ischeck = false;
        if (item.roleID) {
          this.lstNeedRemoveRoles.push(item);
          this.removeRoles();
        }
        this.countApp = this.countApp - 1;
        for (let i = 0; i < this.lstFunc.length; i++) {
          if (item.functionID === this.lstFunc[i].functionID) {
            this.lstFunc[i].roleID = null;
            this.lstFunc[i].roleName = null;
            this.lstFunc[i].color = null;
          }
        }
        if (this.countApp < 0) {
          this.countApp = 0;
          this.listChooseRole = [];
        }
        for (let i = 0; i < this.listChooseRole.length; i++) {
          if (item.functionID === this.listChooseRole[i].functionID) {
            this.listChooseRole.splice(i, 1);
          }
        }
      } else {
        this.countApp = this.countApp + 1;
        item.idChooseRole = this.countApp;
        let checkExist = true;
        this.listChooseRole.forEach((element) => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          this.listChooseRole.push(item);
        }
        item.ischeck = true;
      }
    } else {
      if (event.target.checked === false) {
        item.ischeck = false;
        this.countService = this.countService - 1;
        for (let i = 0; i < this.lstEmp.length; i++) {
          if (item.functionID === this.lstEmp[i].functionID) {
            this.lstEmp[i].roleID = null;
            this.lstEmp[i].roleName = null;
            this.lstEmp[i].color = null;
          }
        }
        if (this.countService < 0) {
          this.countService = 0;
          this.listChooseRole = [];
        }

        for (let i = 0; i < this.listChooseRole.length; i++) {
          if (item.functionID === this.listChooseRole[i].functionID) {
            this.listChooseRole.splice(i, 1);
          }
        }
      } else {
        this.countService = this.countService + 1;
        item.idChooseRole = this.countService;
        let checkExist = true;
        this.listChooseRole.forEach((element) => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          item.roleID = '';
          this.listChooseRole.push(item);
        }
        item.ischeck = true;
      }
    }
    this.detectorRef.detectChanges();
  }

  onCbx(event, item?: any) {
    if (event.data) {
      // let dataTemp = JSON.parse(JSON.stringify(item));
      item.roleID = event.data;
      let curRole = this.listRoles.find((role) => role.recID == item.roleID);
      item.roleName = curRole?.roleName;
      item.color = curRole?.color;

      // let lstTemp = JSON.parse(JSON.stringify(this.listChooseRole));
      // lstTemp.forEach((res) => {
      //   if (res.functionID == dataTemp.functionID) {
      //     res.roleID = item.roleID;
      //     res.roleID = item.roleID;
      //     res.roleName = item.roleName;
      //     res.color = item.color;
      //     res.userID = this.userID;
      //   }
      // });
      // this.listChooseRole = lstTemp;

      this.lstNeedAddRoles.push(item);

      this.addRoles().subscribe((isAddSuccess: boolean) => {
        if (!isAddSuccess) {
          item.ischeck = false;
          item.roleID = null;
          event.data = null;
          this.lstNeedAddRoles = this.lstNeedAddRoles.filter((role) => {
            return role.module != item.module;
          });
          this.listChooseRole = this.listChooseRole.filter((role) => {
            return role.module != item.module;
          });
          console.log('lstneedadd', this.lstNeedAddRoles);
          console.log('listChooseRole', this.listChooseRole);

          this.detectorRef.detectChanges();
        }
      });
    }
  }

  checkClickValueOfUserRoles(value?: any) {
    if (value == null) {
      return true;
    }
    return false;
  }

  //check valid quantity add new modules

  onSave() {
    this.checkRoleIDNull = false;
    if (this.listChooseRole) {
      this.listChooseRole.forEach((res) => {
        if (res?.roleID == null) {
          this.notiService.notifyCode(
            'AD006',
            null,
            "'" + res.customName + "'"
          );
          this.checkRoleIDNull = true;
          return;
        }
      });
    }
    if (this.checkRoleIDNull == false) {
      if (this.CheckListUserRoles() === this.optionFirst) {
        this.notiService.notifyCode('AD006');
      } else if (this.CheckListUserRoles() === this.optionSecond) {
        this.dialogSecond.close([this.listChooseRole]);
        this.detectorRef.detectChanges();
      } else {
        // this.notiService.notifyCode('Không có gì thay đổi');
        this.dialogSecond.close([this.listChooseRole]);
      }
    }
  }

  CheckListUserRoles() {
    for (let i = 0; i < this.listChooseRole.length; i++) {
      if (this.checkClickValueOfUserRoles(this.listChooseRole[i].roleID)) {
        return this.optionFirst;
      }
    }
    if (this.listChooseRole.length > 0) {
      return this.optionSecond;
    }
    return this.optionThird;
  }
}
