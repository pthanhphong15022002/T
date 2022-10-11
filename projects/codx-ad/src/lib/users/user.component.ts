import { ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./user.component.scss'],
})
export class UserComponent extends UIComponent {
  views: Array<ViewModel> = [];
  @ViewChild('tempFull') tempFull: CodxTempFullComponent;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('view') codxView!: any;
  itemSelected: any;
  dialog!: DialogRef;
  button?: ButtonModel;
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

  headerText = '';
  clickMF(e: any, data?: any) {
    this.headerText = e.text;
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
      case 'ADS0501':
        this.stop(data);
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
        '<div class="d-flex align-items-center mb-1"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        buID +
        '</span></div>';

    return desc + '</div>';
  }

  add(e) {
    this.headerText = e.text;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto'; // s k thấy gửi từ ben đây,
      this.dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e?.event) {
          e.event.modifiedOn = new Date();
          this.view.dataService.update(e.event).subscribe();
          this.changeDetectorRef.detectChanges();
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
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfunc.openSide(AddUserComponent, obj, option);
        this.dialog.closed.subscribe((x) => {
          if (!x?.event) this.view.dataService.clear();
          if (x.event) {
            x.event.modifiedOn = new Date();
            this.view.dataService.update(x.event).subscribe();
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        // data.userID = this.view.dataService.dataSelected?.userID;
        res['chooseRoles'] = data.chooseRoles;
        var obj = {
          formType: 'copy',
          dataCopy: res,
          headerText: this.headerText,
        };
      }
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      this.dialog.closed.subscribe((x) => {
        if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event).subscribe();
        }
      });
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
    this.itemSelected = val?.data;
    this.dt.detectChanges();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
  //#endregion

  changeDataMF(e: any) {
    var dl = e.filter((x: { functionID: string }) => x.functionID == 'SYS02');
    dl[0].disabled = true;
  }
}
