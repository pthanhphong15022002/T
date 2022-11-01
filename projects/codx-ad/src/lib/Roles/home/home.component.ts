import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CacheService,
  CodxListviewComponent,
  DialogRef,
  NotificationsService,
  SidebarModel,
  TenantStore,
  UIComponent,
  ViewType,
} from 'codx-core';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TempService } from '../services/temp.service';
import { RolesService } from '../services/roles.service';
import { CodxAdService } from '../../codx-ad.service';
import { RoleEditComponent } from '../role-edit/role-edit.component';

declare var $: any;
@Component({
  selector: 'app-roles',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
  urlDetailRoles: any;

  @ViewChild('templateListView') templateListView!: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private tenantStore: TenantStore,
    private tempService: TempService,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      this.funcID = params['funcID'];
    });
    this.cache.moreFunction('Roles', 'grvRoles').subscribe((res) => {
      this.urlDetailRoles = res[0]?.url;
    });
    this.tenant = this.tenantStore.get()?.tenant;
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngOnDestroy(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.templateListView,
          contextMenu: '',
        },
      },
    ];
  }
  ngOnChanges() {
    if (!this.isLoad) return;
  }

  LinkDetail(recID, roleName, isSystem) {
    this.tempService.roleName = roleName;
    this.tempService.isSystem = isSystem;
    this.codxService.navigate('', this.urlDetailRoles, { recID: recID });
  }

  openFormEdit(data) {
    var obj = {
      role: data,
      mode: 'edit',
    };

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
      var color = $elm.css('background-color');
      if (color == 'rgba(0, 0, 0, 0)') color = this.getRandomColor();
      return {
        'background-color': color,
        'background-image': 'none',
      };
    }
    return elm;
  }

  getRandomColor(): string {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  SaveasRole(data, saveas): void {
    this.tempService.changeDatasaveas('1');
  }

  openFormAdd(e) {
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        role: res,
        mode: 'add',
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(RoleEditComponent, obj, option);
    });
  }

  clickMF(e, item) {
    switch (e.functionID) {
      case 'SYS03':
        this.openFormEdit(item);
        break;
      case 'SYS02':
        break;
    }
  }
}
