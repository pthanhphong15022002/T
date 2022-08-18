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
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
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
    private callfunc: CallFuncService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activeRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
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

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  openPopup(item: any) {
    this.dialog = this.callfc.openForm(ViewUsersComponent, ' ', 300, 400, '', item);
    this.dialog.closed.subscribe(e => {
      console.log(e);
    })
  }

  convertHtmlAgency(buID: any) {
    var desc = '<div class="d-flex">';
    if (buID)
      desc += '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="ms-1">' + buID + '</span></div>';

    return desc + '</div>';
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        userType: 'userGroup',
      }
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(AddUserGroupsComponent, obj, option);

    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      var obj = {
        userType: 'userGroup',
      }
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(AddUserGroupsComponent, obj, option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected]).subscribe();
  };

  //#region Functions
  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }

  selectedChange(val: any) {
    console.log(val);
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
