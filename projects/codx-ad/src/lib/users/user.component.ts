import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  AuthStore,
  ViewModel,
  ViewType,
  DialogRef,
  ButtonModel,
  SidebarModel,
  CallFuncService,
  CodxTempFullComponent,
  RequestOption,
  AlertConfirmInputConfig,
  NotificationsService,
} from 'codx-core';
import {
  Component,
  OnInit,
  inject,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  Input,
  Optional,
} from '@angular/core';
import { ViewUsersComponent } from './view-users/view-users.component';
import { AddUserComponent } from './add-user/add-user.component';
import { CodxAdService } from '../codx-ad.service';

@Component({
  selector: 'lib-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent extends UIComponent {
  // @Input() formModel: any;
  views: Array<ViewModel> = [];
  @ViewChild('tempFull') tempFull: CodxTempFullComponent;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('view') codxView!: any;
  itemSelected: any;
  dialog!: DialogRef;
  button?: ButtonModel;

  // @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;

  user: any;
  funcID: string;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activeRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private codxAdService: CodxAdService,
    private notifySvr: NotificationsService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
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
    this.view.dataService.methodSave = 'AddUserAsync';
    this.view.dataService.methodUpdate = 'UpdateUserAsync';
    this.changeDetectorRef.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'ADS0501':
        this.stop(data);
        break;
    }
  }
  // ADS0501

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
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

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto'; // s k thấy gửi từ ben đây,
      this.dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      this.dialog.closed.subscribe((e) => {
        if (e?.event) {
          this.delete(e?.event);
        }
      });
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe((res: any) => {
        if (res.data) {
          this.codxAdService.deleteFile(res.data.userID, 'AD_Users', true);
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
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      });
  }

  stop(data: any) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifySvr.alertCode('AD009', config).subscribe((x) => {
      if (x.event.status == 'Y') {
        data.stop = true;
        this.codxAdService
          .stopUser(data, false, null, data.stop)
          .subscribe((res) => {
            if (res) {
              this.view.dataService.remove(res).subscribe();
              this.detectorRef.detectChanges();
            }
          });
      }
    });
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
