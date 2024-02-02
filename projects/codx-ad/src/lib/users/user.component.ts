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
  FormModel,
  DialogModel,
  CodxService,
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
import { environment } from 'src/environments/environment';
import { PleaseUseComponent } from './please-use/please-use.component';
import { PopActiveAccountComponent } from './pop-active-account/pop-active-account.component';
import { Subject, takeUntil } from 'rxjs';

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
  @ViewChild('please_use') please_use: TemplateRef<any>;

  itemSelected: any;
  dialog!: DialogRef;
  button?: ButtonModel[];
  user: any;
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
    this.button = [
      {
        id: 'btnAdd',
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
    this.view.dataService.methodSave = 'AddUserAsync';
    this.view.dataService.methodUpdate = 'UpdateUserAsync';
    this.changeDetectorRef.detectChanges();
  }

  headerText = '';
  clickMF(e: any, data?: any) {
    if (data) this.view.dataService.dataSelected = data;
    this.headerText = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit('edit', data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'ADS0501':
        this.stop(data);
        break;
      case 'ADS0502':
        this.activeAccount(data);
        break;

      default:
        break;
    }
  }

  activeAccount(data) {
    console.log('data', data);
    let dlog = this.callfc.openForm(
      PopActiveAccountComponent,
      '',
      500,
      300,
      '',
      data
    );
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

  pleaseUse(e) {
    if (environment.saas == 0) {
      this.headerText = e.text;
      this.add();
    } else {
      let optionForm = new DialogModel();
      optionForm.DataService = this.view?.currentView?.dataService;
      optionForm.FormModel = this.view?.currentView?.formModel;
      var dialog = this.callfc.openForm(
        PleaseUseComponent,
        '',
        400,
        70,
        '',
        '',
        '',
        optionForm
      );
      dialog.closed.subscribe((x) => {
        if (x.event) {
          this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
            if (res) {
              let dataMF: any = [];
              if (x.event?.formType == 'invite') {
                dataMF = res;
                dataMF = dataMF.filter((y) => y.functionID == 'SYS01');
                this.headerText = dataMF[0].customName;
                this.invite(x.event?.data);
              } else if (x.event?.formType == 'edit') {
                dataMF = res;
                dataMF = dataMF.filter((y) => y.functionID == 'SYS03');
                this.headerText = dataMF[0].customName;
                this.edit(x.event?.formType, x.event?.data);
              } else {
                dataMF = res;
                dataMF = dataMF.filter((y) => y.functionID == 'SYS01');
                this.headerText = dataMF[0].customName;
                this.add(x.event?.data);
              }
            }
          });
        }
      });
    }
  }

  add(email = null) {
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        funcID: this.funcID,
        formType: 'add',
        headerText: this.headerText,
        email: email,
        data: res,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto'; // s k thấy gửi từ ben đây,
      let dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (e?.event) {
          option.DataService.update(
            JSON.parse(JSON.stringify(e.event.user))
          ).subscribe();
        }
      });
    });
  }

  invite(data) {
    data['isNew'] = true;
    var obj = {
      funcID: this.funcID,
      formType: 'invite',
      data: data,
      headerText: this.headerText,
    };
    this.view.dataService.addDatas.set(data.recID, data);
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = 'Auto'; // s k thấy gửi từ ben đây,
    let dialog = this.callfunc.openSide(AddUserComponent, obj, option);
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        option.DataService.update(
          JSON.parse(JSON.stringify(e?.event?.user))
        ).subscribe();
      }
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe((res: any) => {
        if (res.data) {
          this.codxAdService
            .deleteFile(res.data.userID, 'AD_Users', true)
            .subscribe();
        }
      });
  }

  edit(formType: string, data?) {
    this.view.dataService.edit(data).subscribe((res: any) => {
      var obj = {
        funcID: this.funcID,
        formType: formType,
        data: res,
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      let dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (e?.event) {
          option.DataService.update(
            JSON.parse(JSON.stringify(e?.event?.user))
          ).subscribe();
        }
      });
    });
  }

  viewInfo(formType: string, data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    var obj = {
      formType: formType,
      headerText: this.headerText,
    };
    let option = new SidebarModel();
    option.DataService = this.view?.currentView?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    option.Width = 'Auto';
    this.callfunc.openSide(AddUserComponent, obj, option);
  }

  copy(data?: any) {
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
      let dialog = this.callfunc.openSide(AddUserComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (e?.event) {
          option.DataService.update(
            JSON.parse(JSON.stringify(e?.event?.user))
          ).subscribe();
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
        data.status = '3';
        this.codxAdService.stopUser(data.userID).subscribe((res) => {
          if (res) {
            // this.view.dataService.remove(res).subscribe();
            this.view.dataService.update(data).subscribe();
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

  changeDataMF(e: any, data: any) {
    if (!data) return;
    let dl = e.filter((x: { functionID: string }) => x.functionID == 'SYS02');
    dl[0].disabled = true;
    let copyMF = e.filter((x) => x.functionID == 'SYS04');
    copyMF[0].disabled = true;
    if (data.status == '1') {
      let activeMF = e.find((x) => x.functionID == 'ADS0502');
      if (activeMF) {
        activeMF.disabled = true;
      }
    }
    if (data.stop) {
      //disabled mf user.stop = true
      let lstDisableMF = ['SYS03', 'ADS0501', 'ADS0501', 'ADS0502'];

      e.forEach((mf) => {
        if (lstDisableMF.includes(mf.functionID)) {
          mf.disabled = true;
        }
      });
    }
  }
}
