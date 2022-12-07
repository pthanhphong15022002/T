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
  headerText = '';

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
    this.changedt.detectChanges();
  }
  ngOnChanges() {
    if (!this.isLoad) return;
  }

  LinkDetail(recID, roleName, isSystem) {
    this.tempService.roleName.next(roleName);
    this.tempService.isSystem = isSystem;
    this.codxService.navigate('', this.urlDetailRoles, { recID: recID });
  }

  openFormEdit(data, type = 'edit') {
    var obj = {
      role: data,
      mode: type,
    };

    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(RoleEditComponent, obj, option);
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

  // openFormAdd(e) {
  //   this.view.dataService.addNew().subscribe((res: any) => {
  //     var obj = {
  //       role: res,
  //       mode: 'add',
  //     };
  //     let option = new SidebarModel();
  //     option.DataService = this.view?.dataService;
  //     option.FormModel = this.view?.formModel;
  //     option.Width = '550px';
  //     this.dialog = this.callfc.openSide(RoleEditComponent, obj, option);
  //   });
  // }

  add(evt) {
    this.headerText = evt.text + ' ' + this.view?.function?.customName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      var dialog = this.callfc.openSide(RoleEditComponent, obj, option);
      // this.dialog.closed.subscribe((e) => {
      //   if (!e?.event) this.view.dataService.clear();
      //   if (e?.event) {
      //     this.view.dataService.update(e.event).subscribe();
      //     this.changedt.detectChanges();
      //   }
      // });
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe((res: any) => {
        if (res.data) {
          // this.codxAdService
          //   .deleteFile(res.data.userID, 'AD_Users', true)
          //   .subscribe();
        }
      });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        var dialog = this.callfc.openSide(RoleEditComponent, obj, option);

        dialog.closed.subscribe((x) => {
          // if (!x?.event) this.view.dataService.clear();
          // if (x.event) {
          //   x.event.modifiedOn = new Date();
          //   this.view.dataService.update(x.event).subscribe();
          //   this.changeDetectorRef.detectChanges();
          // }
        });
      });
  }

  copy(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        var obj = {
          formType: 'copy',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        var dialog = this.callfc.openSide(RoleEditComponent, obj, option);
      }
    });
  }

  clickMF(e, item) {
    this.headerText = e.text + ' ' + this.view?.function?.customName;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(item);
        break;
      case 'SYS02':
        this.delete(item);
        break;
      case 'SYS04':
        this.copy(item);
        break;
    }
  }
}
