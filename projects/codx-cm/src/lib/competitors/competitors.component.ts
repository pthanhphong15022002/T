import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { firstValueFrom } from 'rxjs';
import { PopupAddCmCustomerComponent } from '../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CmCustomerDetailComponent } from '../cmcustomer/cmcustomer-detail/cmcustomer-detail.component';


@Component({
  selector: 'lib-competitors',
  templateUrl: './competitors.component.html',
  styleUrls: ['./competitors.component.css']
})

export class CompetitorsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  @ViewChild('customerDetail') customerDetail: CmCustomerDetailComponent;

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  // showButtonAdd = false;
  button?: ButtonModel[];
  dataSelected: any;
  //region Method
  service = 'CM';
  assemblyName = 'ERM.Business.Core';
  method = 'LoadDataAsync';
  className = 'DataBusiness';
  entityName = 'CM_Competitors';
  idField = 'recID';
  //endregion
  asideMode: string;
  leverSetting = 0;
  user: any;
  isAdmin: boolean = false;
  titleAction = '';
  gridViewSetup: any;

  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
    private codxShareService: CodxShareService,
    private authstore: AuthStore
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.user = this.authstore.get();
  }

  async onInit() {
    this.asideMode = this.codxService.asideMode;
    this.button = [
      {
        id: 'btnAdd',
      },
    ];
    this.checkAdmin();
    var param = await firstValueFrom(
      this.cache.viewSettingValues('CMParameters')
    );
    let lever = 0;
    if (param?.length > 0) {
      let dataParam = param.filter((x) => x.category == '1' && !x.transType)[0];
      let paramDefault = JSON.parse(dataParam.dataValue);
      lever = paramDefault['ControlInputAddress'] ?? 0;
    }
    this.leverSetting = lever;
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          template2: this.templateMore,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddCrmAsync';
    this.view.dataService.methodUpdate = 'UpdateCrmAsync';
    this.view.dataService.methodDelete = 'DeleteCmAsync';
    this.cmSv.initCache().subscribe((res) => {});
    this.detectorRef.detectChanges();
  }

  async checkAdmin() {
    let data = await firstValueFrom(this.cmSv.getAdminRolesByModule());
    let isAdmin = false;
    if (data) {
      let lstId = data.split(';');
      isAdmin = lstId.some((x) => lstId.includes(this.user.userID));
    }
    this.isAdmin = isAdmin || this.user.administrator;
  }

  //#region event codx-views
  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
      default:
        let f = evt.data;
        let data = evt.model;
        if (!data) data = this.view.dataService.dataSelected;
        this.codxShareService.defaultMoreFunc(
          f,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS05':
        this.viewCM(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        // this.df.detectChanges();
        break;
      }
    }
  }

  changeDataMF(e, data, type = 2) {
    if (e != null && data != null) {
      e.forEach((res) => {
        if (type == 11) res.isbookmark = false;
        if (this.dataSelected != null) {
          switch (res.functionID) {
            case 'SYS03':
              if (!data.write) res.disabled = true;
              break;
            case 'SYS02':
              if (!data.delete) res.disabled = true;
              break;
          }
        } else {
          res.disabled = true;
        }
      });
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  onMoreMulti(e) {}

  searchChanged(e) {
    this.view.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  selectedChange(data) {
    if (this.dataSelected?.recID != data?.data?.recID) {
      this.dataSelected = data?.data ? data?.data : data;
    }
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region  CRUD and more funcs
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '800px';
        var obj = {
          action: 'add',
          title: this.titleAction,
          checkType: '4', //Partners
        };
        var dialog = this.callfc.openSide(
          PopupAddCmCustomerComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e && e.event != null) {
            let data = e?.event[0];
            let lstContacts = e?.event[1];
            data.modifiedOn = new Date();
            this.dataSelected = JSON.parse(JSON.stringify(data));
            //this.view.dataService.update(data, true).subscribe();
            // this.customerDetail.loadTag(this.dataSelected);
            this.detectorRef.detectChanges();
            // this.customerDetail.listTab(this.funcID);
          }
        });
      });
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '800px';

          var obj = {
            action: 'edit',
            title: this.titleAction,
            checkType: '4', //Contact
          };
          var dialog = this.callfc.openSide(
            PopupAddCmCustomerComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event != null) {
              let data = e.event[0];
              let lstContact = e.event[1] ?? [];
              let lstAddress = e.event[2] ?? [];
              data.modifiedOn = new Date();
              this.dataSelected = JSON.parse(JSON.stringify(data));
              if (this.customerDetail) {
                this.customerDetail.getOneCustomerDetail(this.dataSelected);
                this.customerDetail.onChangeContact(lstContact);
                this.customerDetail.onChangeAddress(lstAddress);
              }
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      this.cache.functionList(this.funcID).subscribe((fun) => {
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '800px';

        this.cmSv
          .getAutonumber(this.funcID, fun.entityName, 'ContactID')
          .subscribe((x) => {
            var obj = {
              action: 'copy',
              title: this.titleAction,
              recIdOld: this.dataSelected.recID,
              autoNumber: x,
              checkType: '4' //Contact
            };
            var dialog = this.callfc.openSide(
              PopupAddCmCustomerComponent,
              obj,
              option
            );
            dialog.closed.subscribe((e) => {
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
                let data = e?.event[0];
                let lstContacts = e?.event[1];
                data.modifiedOn = new Date();
                this.dataSelected = JSON.parse(JSON.stringify(data));
                this.view.dataService.update(data, true).subscribe();
                // this.customerDetail.loadTag(this.dataSelected);
                this.detectorRef.detectChanges();

                this.detectorRef.detectChanges();
              }
            });
          });
      });
    });
  }

  viewCM(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '800px';

          var obj = {
            action: 'edit',
            title: this.titleAction,
            isView: true,
            checkType: '4' //Contact
          };
          var dialog = this.callfc.openSide(
            PopupAddCmCustomerComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event != null) {
              let data = e.event[0];
              let lstContact = e.event[1] ?? [];
              let lstAddress = e.event[2] ?? [];
              data.modifiedOn = new Date();
              this.dataSelected = JSON.parse(JSON.stringify(data));
              if (this.customerDetail) {
                this.customerDetail.getOneCustomerDetail(this.dataSelected);
                this.customerDetail.onChangeContact(lstContact);
                this.customerDetail.onChangeAddress(lstAddress);
              }
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        });
      });
  }

  async delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete(
        [this.view.dataService.dataSelected],
        true,
        (opt) => this.beforeDel(opt),
        null,
        null,
        null,
        null,
        false
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.notiService.notifyCode('SYS008');
        }
      });

    this.detectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteCmAsync';
    opt.className = 'CompetitorsBusiness';
    opt.assemblyName = 'CM';
    opt.data = [itemSelected.recID, this.entityName];
    return true;
  }

  addressNameCMEmit(e) {
    this.dataSelected.address = e ? e?.address : null;
    this.dataSelected.provinceID = e ? e?.provinceID : null;
    this.dataSelected.districtID = e ? e?.districtID : null;
    this.dataSelected.wardID = e ? e?.wardID : null;
    this.view.dataService.update(this.dataSelected, true).subscribe();
    this.detectorRef.detectChanges();
  }
  //#endregion
}



