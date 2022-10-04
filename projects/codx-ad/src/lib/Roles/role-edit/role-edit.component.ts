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
} from "@angular/core";
import { DialogData, DialogRef, NotificationsService, TenantStore, UIComponent } from "codx-core";
import { CodxAdService } from "../../codx-ad.service";
import { AD_Roles } from "../../models/AD_Roles.models";
import { RolesService } from "../services/roles.service";
import { TempService } from "../services/temp.service";

declare var $: any;
@Component({
  selector: "app-role-edit",
  templateUrl: "./role-edit.component.html",
  styleUrls: ["./role-edit.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class RoleEditComponent extends UIComponent implements OnInit, OnDestroy {
  roleID: any;
  data: any = {};
  form = "";
  tenant = "";
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

  @Input() modelPage: any;

  constructor(private injector: Injector,
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
    this.cache.moreFunction(this.dialog.formModel.formName, this.dialog.formModel.gridViewName).subscribe(res => {
      this.urlDetailRoles = res[0]?.url;
    })
    this.cache.gridViewSetup(this.dialog.formModel.formName, this.dialog.formModel.gridViewName).subscribe(res => {
      if (res) this.gridViewSetup = res;
    })
    this.roles = dt.data[0]?.data;
    this.formType = dt.data[0]?.formType;
    if (this.formType == 'edit')
      this.dataUpdate = dt.data[0]?.dataUpdate;
  }

  ngOnDestroy(): void { }

  onInit(): void {
    this.tempService.loadRecID.subscribe((res: string) => {
      if (res) {
        this.roleID = res;
        this.api
          .call("ERM.Business.AD", "RolesBusiness", "GetAsync", [this.roleID])
          .subscribe((res) => {
            if (res && res.msgBodyData[0]) {
              this.data = res.msgBodyData[0];
              if (this.tempService.isNew) {
                this.saveas = "2";
              } else this.saveas = "0";

              this.changedr.detectChanges();
            }
          });
      } else {
        this.saveas = "1";
        this.roleID = "00000000-0000-0000-0000-000000000000";
        this.data = {};
      }
    });
  }

  ngAfterViewInit() {
    console.log(this.gridViewSetup)
  }

  redirectPagePermissions() {
    //TEMP
    // this.mainService.navigatePageUrl(`ad/roledetail/${this.roleID}`);
    //TEMP

    this.codxService.navigate('', this.urlDetailRoles, { recID: this.roleID })

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
    this.dialog.close();

  }
  //TEMP
  // confirmAfterSave(messageCode, isRedirectPage) {
  //   this.mainService.confirmDialog(messageCode).then((result) => {
  //     this.SaveRole(true, result, isRedirectPage);
  //   });
  // }
  //TEMP
  clickBtnSave() {
    // if (this.saveas == "2") {
    //   // Copy
    //   this.confirmAfterSave("AD002", false);
    // } else {
    //   this.SaveRole(true, false, false);
    // }

    if (this.formType == 'edit' || this.formType == 'add')
      this.SaveRole(true, false, false);
    else {

    }

  }
  SaveRole(
    isLoadDetail = false,
    isCopyPermision: boolean,
    isRedirectPage: boolean = true
  ) {
    var isNew;
    if (this.formType == 'add')
      isNew = true;
    else isNew = false;
    var listview = this.adsv.listview;
    this.api
      .call("ERM.Business.AD", "RolesBusiness", "SaveRoleAsync", [
        this.roleID,
        this.data.roleName,
        this.data.description,
        isNew,
        isCopyPermision,
      ])
      .subscribe((res) => {
        this.roleID = "00000000-0000-0000-0000-000000000000";
        if (res && res.msgBodyData[0]) {
          $(".role-name").val("");
          $(".description").val("");
          $("#kt_demo_panel.edit-" + this.modelPage.formName).removeClass(
            "offcanvas-on"
          );
          var data = res.msgBodyData[0];
          this.roleID = data.recID;
          if (isLoadDetail) listview.addHandler(data, isNew, "recID");
          //this.reloadComponent();
          else {
            if (isRedirectPage) {
              this.tempService.roleName = data.roleName;
              //TEMP
              // this.router.navigate([
              //   `${this.tenant}/ad/roledetail/${this.roleID}`,
              // ]);
              //TEMP
            }
          }
          // this.notificationsService.notify("Hệ thống thực thi thành công!");
          // alert("Hệ thống thực thi thành công!");
        } else {
          this.notificationsService.notifyCode("SYS020");
        }
      });
  }

  reloadComponent() {
    let currentUrl = this.router.url;
    //TEMP
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = "reload";
    // this.router.navigate([currentUrl]);
    //TEMP

    //this.roleID = this.newGuid();
  }

  closeEdit(): void {
    $("#kt_demo_panel.edit-" + this.modelPage.formName).removeClass(
      "offcanvas-on"
    );
  }
  // valueChange(data) {
  //   console.log(data);
  // }
  newGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  valueChange(e) {
    console.log(e);
  }
}
