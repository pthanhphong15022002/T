import { ApiHttpService, AuthStore, ButtonModel, CacheService, CodxListviewComponent, DialogRef, NotificationsService, SidebarModel, TenantStore, UIComponent } from 'codx-core';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TempService } from "../services/temp.service";
import { RolesService } from '../services/roles.service';
import { CodxAdService } from '../../codx-ad.service';
import { RoleEditComponent } from '../role-edit/role-edit.component';
import { V } from '@angular/cdk/keycodes';

declare var $: any;
@Component({
  selector: "app-roles",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  // providers: [EditService],

  encapsulation: ViewEncapsulation.None,
})
export class RolesComponent extends UIComponent implements OnInit, OnDestroy {
  data: any;
  tenant: string;
  isLoad = true;
  index = 0;
  funcID = '';
  views = [];
  button?: ButtonModel;
  dialog: DialogRef;

  @ViewChild("listRoles") listRoles: CodxListviewComponent;
  constructor(
    private injector: Injector,
    private temp: TempService,
    private tenantStore: TenantStore,
    private tempService: TempService,
    private changeDR: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private rolesService: RolesService,
    private adsv: CodxAdService,
    private auth: AuthStore,
    private route: ActivatedRoute,
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      this.funcID = params['funcID'];
    })
    const user = this.auth.get();
    this.tenant = this.tenantStore.get()?.tenant;
  }

  onInit(): void {
    // hidden button tree
    // setTimeout(() => {
    //   $("#btnTreeView").hide();
    // }, 2000);
    this.button = {
      id: 'btnAdd',
    };
  }

  ngOnDestroy(): void {
    // show buton tree
    var btnTreeView = $("#btnTreeView");
    btnTreeView.show();
  }

  ngAfterViewInit() {
    //this.adsv.listview = this.listRoles;
    //this.isLoad = false;
  }
  ngOnChanges() {
    if (!this.isLoad) return;
  }

  // action(para: ActionArg): void {
  //   switch (para.type) {
  //     case ActionType.add: // open popup
  //       $("#kt_demo_panel.edit-" + this.modelPage.formName).addClass(
  //         "offcanvas-on"
  //       );
  //       break;
  //     case ActionType.quickSearch: // search data
  //       if (this.listRoles) {
  //         this.listRoles.SearchText = para.arg;
  //         this.listRoles.onChangeSearch();
  //       }
  //       break;
  //   }
  // }

  LinkDetail(recID, roleName, isSystem) {
    // if (roleType == '1' || roleType == '2') return;
    this.tempService.roleName = roleName;
    this.tempService.isSystem = isSystem;

    //TEMP
    // this.router.navigate([`${this.tenant}/ad/roledetail/${recID}`]);
    //TEMP
  }

  // openEdit(id, isnew) {
  //   this.tempService.isNew = isnew;
  //   this.tempService.id = id;
  //   this.tempService.appendRecID(id);
  //   if (this.tempService.isNew) {
  //     this.tempService.changeDatasaveas("2"); //Sao chép
  //   } else this.tempService.changeDatasaveas("0"); //Chỉnh sửa

  //   this.tempService.id = "";
  // }

  openFormEdit(data) {
    var obj = [{
      data: this.listRoles.dataService.data,
      dataUpdate: data,
      formType: 'edit'
    }]

    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(RoleEditComponent, obj, option);
  }

  delete(data) {
    // var t = this;
    // this.confirmSv
    //   .confirm("Thông báo", "Bạn có muốn xóa?")
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       this.api
    //         .call("ERM.Business.AD", "RolesBusiness", "DeleteAsync", [
    //           data.recID,
    //         ])
    //         .subscribe((res) => {
    //           if (res && res.msgBodyData[0]) {
    //             t.listRoles.removeHandler(data, "recID");
    //           }
    //         });
    //     }
    //   });
  }

  styleObject(elm): Object {
    var $elm = $(elm);
    if ($elm.length > 0) {
      var color = $elm.css("background-color");
      if (color == "rgba(0, 0, 0, 0)") color = this.getRandomColor();
      return {
        "background-color": color,
        "background-image": "none",
      };
    }
    return elm;
  }

  getRandomColor(): string {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return "#" + ("000000" + color).slice(-6);
  }

  SaveasRole(data, saveas): void {
    this.tempService.changeDatasaveas("1");
  }

  openFormAdd(e) {
    var obj = [{
      data: this.listRoles.dataService.data,
      formType: 'add',
    }]

    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(RoleEditComponent, obj, option);
    // this.dialog.closed.subscribe(x => {
    //   this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
    // });
  }

  clickMF(e, item) {
    switch(e.functionID) {
      case 'edit':
        this.openFormEdit(item);
        break;
      case 'delete':
        break;
    }
  }
}
