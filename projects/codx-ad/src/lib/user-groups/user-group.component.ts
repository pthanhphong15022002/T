import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxAdService } from '../codx-ad.service';
import { ViewUsersComponent } from '../users/view-users/view-users.component';
import { AddUserGroupsComponent } from './add-user-groups/add-user-groups.component';

@Component({
  selector: 'lib-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.css'],
})
export class UserGroupsComponent extends UIComponent {
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  itemSelected: any;
  dialog!: DialogRef;
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];

  user: any;
  funcID: string;

  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activeRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private codxAdService: CodxAdService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activeRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
    this.view.dataService.methodSave = '';
    this.changeDetectorRef.detectChanges();
  }

  headerText = '';
  clickMF(e: any, data?: any) {
    this.headerText = e?.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add(e);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      // case 'SYS02':
      //   this.delete(data);
      //   break;
      case 'ADS0601':
        this.stop(data);
        break;
    }
  }

  stop(data: any) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifySvr.alertCode('AD009', config).subscribe((x) => {
      if (x.event.status == 'Y') {
        data.stop = true;
        this.codxAdService
          .stopUser(data)
          .subscribe((res) => {
            if (res) {
              this.view.dataService.remove(res).subscribe();
              this.detectorRef.detectChanges();
            }
          });
      }
    });
  }

  changeDataMF(e: any) {
    var dl = e.filter((x: { functionID: string }) => x.functionID == 'SYS02');
    dl[0].disabled = true;
  }

  openPopup(item: any) {
    this.dialog = this.callfc.openForm(
      ViewUsersComponent,
      ' ',
      300,
      400,
      '',
      item
    );
    this.dialog.closed.subscribe((e) => {});
  }

  convertHtmlAgency(buID: any) {
    var desc = '<div class="d-flex">';
    if (buID)
      desc +=
        '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="ms-1">' +
        buID +
        '</span></div>';
    return desc + '</div>';
  }

  add(e) {
    this.headerText = e?.text;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        userType: 'userGroup',
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(AddUserGroupsComponent, obj, option);
      this.dialog.closed.subscribe((x) => {
        if (!x?.event) this.view.dataService.clear();
      });
    });
  }

  copy(data) {
    var oldID = '';
    if (data) {
      oldID = data._uuid;
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      // data.userID = this.view.dataService.dataSelected?.userID;
      if (res) {
        res['chooseRoles'] = data.chooseRoles;
        var obj = {
          userType: 'userGroup',
          formType: 'copy',
          dataCopy: res,
          oldID: oldID,
          headerText: this.headerText,
        };
      }
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(AddUserGroupsComponent, obj, option);
      this.dialog.closed.subscribe((x) => {
        if (!x?.event) this.view.dataService.clear();
      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
      // this.view.dataService.dataSelected.userID = data._uuid;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          userType: 'userGroup',
          formType: 'edit',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          AddUserGroupsComponent,
          obj,
          option
        );
        this.dialog.closed.subscribe((x) => {
          if (!x?.event) this.view.dataService.clear();
        });
      });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe();
  }

  //#region Functions
  changeView(evt: any) {
    var t = this;
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.dt.detectChanges();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
  //#endregion
}
