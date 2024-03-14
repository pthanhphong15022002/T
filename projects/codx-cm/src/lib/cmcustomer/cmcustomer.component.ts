import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  CacheService,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CmCustomerDetailComponent } from './cmcustomer-detail/cmcustomer-detail.component';
import { PopupAddCmCustomerComponent } from './popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddLeadComponent } from '../leads/popup-add-lead/popup-add-lead.component';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Deals } from '../models/cm_model';

@Component({
  selector: 'codx-cmcustomer',
  templateUrl: './cmcustomer.component.html',
  styleUrls: ['./cmcustomer.component.css'],
})
export class CmCustomerComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() showButtonAdd = false;
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('itemCustomerName', { static: true })
  itemCustomerName: TemplateRef<any>;
  @ViewChild('itemContact', { static: true })
  itemContact: TemplateRef<any>;
  @ViewChild('itemAddress', { static: true }) itemAddress: TemplateRef<any>;
  @ViewChild('itemPriority', { static: true }) itemPriority: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('customerDetail') customerDetail: CmCustomerDetailComponent;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  dialogStatus: DialogRef;

  itemFields: TemplateRef<any>;
  dataObj?: any;
  columnGrids = [];
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
  entityName = 'CM_Customers';
  idField = 'recID';
  //endregion
  predicate = '';
  dataValue = '';
  titleAction = '';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  isButton = true;
  gridViewSetup: any;
  lstCustGroups = [];
  loaded: boolean;
  queryParams: any;
  status = '';
  leverSetting = 0;
  user: any;
  isAdmin: boolean = false;
  // const set value
  asideMode: string;
  readonly btnAdd: string = 'btnAdd';
  tabDefaut = '';
  valueListTab;
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
    private codxShareService: CodxShareService,
    private authstore: AuthStore
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.user = this.authstore.get();
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.loaded = false;
        // this.view.dataService = JSON.parse(JSON.stringify(this.view.dataService));
        this.funcID = param.funcID;
        if (this.queryParams?.recID) {
          this.predicate = 'RecID=@0';
          this.dataValue = this.queryParams?.recID;
        }
        this.isButton = true;
        this.afterLoad();
        this.loaded = true;
      }
    });

    // this.api.execSv<any>('CM','ERM.Business.CM','CustomersBusiness','RPAUpdateAddresscAsync',['CM_Customers']).subscribe(res => {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }


  async onInit() {
    this.asideMode = this.codxService.asideMode;

    this.button = [
      {
        id: this.btnAdd,
      },
    ];
    this.showButtonAdd = true;
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
    //nvthuan taskbar
    const [valueListTab, tabDefaut] = await Promise.all([
      this.cmSv.getValueList("CRM086"),
      this.cmSv.getSettingContract()
    ]);
    this.valueListTab = valueListTab;
    if(tabDefaut){
      this.tabDefaut = tabDefaut?.ActiveTabCustomers;
    }
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

  onLoading(e) {
    // this.afterLoad();
  }

  viewChanged(e) {}

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.afterLoad();
      this.crrFuncID = this.funcID;
    }
  }

  async afterLoad() {
    let funcID = this.funcID
    this.cache.functionList(funcID).subscribe(async (fun) => {
      this.entityName = JSON.parse(JSON.stringify(fun?.entityName));
        this.lstCustGroups = await firstValueFrom(
          this.api.execSv<any>(
            'CM',
            'ERM.Business.CM',
            'CustomerGroupsBusiness',
            'GetListCustGroupsAsync'
          )
        );
        this.cache
          .gridViewSetup(fun?.formName, fun?.gridViewName)
          .subscribe((res) => {
            if (res) {
              this.gridViewSetup = res;
            }
          });

    });
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        if (this.isButton) this.add();
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
      case 'CM0105_1':
      case 'CM0101_1':
        this.setIsBlackList(data, true);
        break;
      case 'CM0105_3':
      case 'CM0101_3':
        this.setIsBlackList(data, false);
        break;
      //Cập nhật status
      case 'CM0105_6':
      case 'CM0101_6':
        this.updateStatusCustomer(data.status);
        break;
      //update address
      case 'CM0105_5':
      case 'CM0101_5':
        let lst = [];
        lst.push(Object.assign({}, data));
        this.updateAutoAddress(lst);
        break;
      case 'CM0101_2':
      case 'CM0105_2':
        this.convertCustomerToLeads(data);
        break;
      case 'CM0101_4':
      case 'CM0105_4':
        this.popupPermissions(data);
        break;
      case 'CM0105_7':
      case 'CM0101_7':
        this.convertCustomerToDeals(data);
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

  onMoreMulti(e) {
    let event = e?.event;
    this.titleAction = event?.text;
    switch (event?.functionID) {
      case 'CM0105_5':
      case 'CM0101_5':
        this.updateAutoAddress(e?.dataSelected);
        break;
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  changeDataMF(e, data, type = 2) {
    if (e != null && data != null) {
      e.forEach((res) => {
        if (type == 11) res.isbookmark = false;
        if (this.dataSelected != null) {
          if (data?.status != '99') {
            switch (res.functionID) {
              case 'SYS03':
                if (!data.write) res.disabled = true;
                break;
              case 'SYS02':
                if (!data.delete) res.disabled = true;
                break;
              case 'CM0105_5':
              case 'CM0101_5':
              case 'CM0105_1':
              case 'CM0101_1':
                if (!data.write || data.isBlackList) res.disabled = true;
                break;
              case 'CM0105_3':
              case 'CM0101_3':
                if (!data.write || !data.isBlackList) res.disabled = true;
                break;
              case 'CM0102_4':
              case 'CM0102_1':
                res.disabled = true;
                break;
              case 'CM0102_2':
                if (
                  data.objectType == null ||
                  data.objectType.trim() == '' ||
                  data.objectType != '1'
                )
                  res.disabled = true;
                break;
              case 'CM0102_3':
                if (
                  data.objectType == null ||
                  data.objectType.trim() == '' ||
                  data.objectType != '3'
                )
                  res.disabled = true;
                break;
              case 'CM0101_4':
              case 'CM0105_4':
                if (
                  data?.owner != this.user?.userID &&
                  !data.assign &&
                  !data.allowPermit &&
                  !this.isAdmin
                )
                  res.disabled = true;
                break;
              case 'SYS003':
              case 'SYS004':
              case 'SYS001':
              case 'SYS002':
                res.disabled = false;
                break;
            }
          } else {
            switch (res.functionID) {
              case 'CM0105_6':
              case 'CM0101_6':
              case 'SYS003':
              case 'SYS004':
              case 'SYS001':
              case 'SYS002':
                res.disabled = false;
                break;
              case 'CM0101_4':
                if (
                  data?.owner != this.user?.userID &&
                  !data.assign &&
                  !data.allowPermit &&
                  !this.isAdmin
                )
                  res.disabled = true;
                break;
              default:
                res.disabled = true;
                break;
            }
          }
        } else {
          res.disabled = true;
        }
      });
    }
  }

  //#region Search
  searchChanged(e) {
    this.view.dataService.search(e);
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region CRUD
  add() {
    this.isButton = false;
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
          checkType: '1' //Customer
        };
        var dialog = this.callfc.openSide(
          PopupAddCmCustomerComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          this.isButton = true;
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
    this.isButton = false;
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
            checkType: '1' //Customer
          };
          var dialog = this.callfc.openSide(
            PopupAddCmCustomerComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            this.isButton = true;
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
    this.isButton = false;
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
          .getAutonumber(
            this.funcID,
            fun.entityName,
            'CustomerID'
          )
          .subscribe((x) => {
            var obj = {
              action: 'copy',
              title: this.titleAction,
              recIdOld: this.dataSelected.recID,
              autoNumber: x,
              checkType: '1' //Customer
            };
            var dialog = this.callfc.openSide(
              PopupAddCmCustomerComponent,
              obj,
              option
            );
            dialog.closed.subscribe((e) => {
              this.isButton = true;
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

  viewCM(data){
    this.isButton = false;
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
            checkType: '1' //Customer
          };
          var dialog = this.callfc.openSide(
            PopupAddCmCustomerComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            this.isButton = true;
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
    opt.className = 'CustomersBusiness';
    opt.assemblyName = 'CM';
    opt.service = "CM";
    opt.data = [itemSelected.recID, this.entityName];
    return true;
  }

  setIsBlackList(data, isBlacklist) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService
      .alertCode(
        'CM007',
        null,
        data?.customerName,
        "'" + this.titleAction?.toLocaleLowerCase() + "'"
      )
      .subscribe((x) => {
        if (x?.event?.status == 'Y') {
          this.cmSv.setIsBlackList(data.recID, isBlacklist).subscribe((res) => {
            if (res) {
              this.dataSelected.isBlackList = isBlacklist;
              if (this.customerDetail)
                this.customerDetail.dataSelected = JSON.parse(
                  JSON.stringify(this.dataSelected)
                );
              // this.customerDetail.getOneCustomerDetail(this.dataSelected.recID, this.funcID);
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.notiService.notifyCode('SYS007');
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }

  //Status
  async updateStatusCustomer(status) {
    var check = false;

    this.status = status;
    this.dialogStatus = this.callfc.openForm(this.updateStatus, '', 500, 350);
    this.dialogStatus.closed.subscribe((ele) => {
      if (ele && ele?.event) {
        this.dataSelected.status = this.status;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.view.dataService.update(this.dataSelected).subscribe();
        this.notiService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  onSave() {
    this.cmSv
      .updateStatusCustoemr(this.dataSelected.recID, this.status)
      .subscribe((res) => {
        if (res) {
          this.dialogStatus.close(res);
        }
      });
  }

  changValueStatus(e) {
    this[e.field] = e?.data;
    this.detectorRef.detectChanges();
  }

  //auto update address
  async updateAutoAddress(datas = []) {
    // let lsts = datas.filter(
    //   (x) => x.address != null && x.address?.trim() != ''
    // );
    // for (var item of lsts) {
    //   let json = await firstValueFrom(
    //     this.api.execSv<any>(
    //       'BS',
    //       'ERM.Business.BS',
    //       'ProvincesBusiness',
    //       'GetLocationAsync',
    //       [item?.address, this.leverSetting]
    //     )
    //   );
    //   if (json != null && json.trim() != '' && json != "null") {
    //     let lstDis = JSON.parse(json);
    //     if (item.provinceID != lstDis?.ProvinceID)
    //       item.provinceID = lstDis?.ProvinceID;
    //     if (item.districtID != lstDis?.DistrictID)
    //       item.districtID = lstDis?.DistrictID;
    //     if (item.wardID != lstDis?.WardID) item.wardID = lstDis?.WardID;
    //   } else {
    //     item.provinceID = null;
    //     item.districtID = null;
    //     item.wardID = null;
    //   }
    // }

    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'RPAUpdateAddresscAsync',
        ['CM_Customers']
      )
      .subscribe((res) => {
        this.notiService.notifyCode('SYS007');
      });
  }

  //convert Customer To Lead
  async convertCustomerToLeads(data) {
    var isCheck = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'CheckConvertCustomerAsync',
        [data.recID]
      )
    );
    if (isCheck) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notiService.alertCode('CM052').subscribe((x) => {
        if (x.event && x.event?.status) {
          if (x?.event?.status == 'Y') {
            this.openFormConvert(data);
          }
        }
      });
    } else {
      this.openFormConvert(data);
    }
  }

  //open form convert
  openFormConvert(data) {
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'GetLeadDefaultAsync',
        [data]
      )
      .subscribe((ele) => {
        if (ele) {
          let lead = ele[0];
          let lstCategory = ele[1];
          let option = new SidebarModel();
          let formModel = new FormModel();
          formModel.funcID = 'CM0205';
          formModel.formName = 'CMLeads';
          formModel.entityName = 'CM_Leads';
          formModel.gridViewName = 'grvCMLeads';
          formModel.userPermission = this?.view?.formModel?.userPermission;
          option.FormModel = formModel;
          option.Width = '800px';
          option.zIndex = 1001;
          this.cache
            .gridViewSetup(formModel.formName, formModel.gridViewName)
            .subscribe((res) => {
              if (res) {
                let gridViewSetup = res;
                var obj = {
                  action: 'add',
                  formMD: formModel,
                  titleAction: this.titleAction,
                  leadIdOld: '',
                  contactIdOld: '',
                  applyFor: '5',
                  processId: null,
                  gridViewSetup: gridViewSetup,
                  applyProcess: false,
                  listCategory: lstCategory,
                  dataConvert: lead,
                  convertCustomerToLead: true,
                };
                let dialogCustomDeal = this.callfc.openSide(
                  PopupAddLeadComponent,
                  obj,
                  option
                );
                dialogCustomDeal.closed.subscribe((e) => {
                  if (e && e.event != null) {
                    this.detectorRef.detectChanges();
                  }
                });
              }
            });
        }
      });
  }

  //share permissions
  popupPermissions(data) {
    let dialogModel = new DialogModel();
    let formModel = new FormModel();
    formModel.formName = 'CMPermissions';
    formModel.gridViewName = 'grvCMPermissions';
    formModel.entityName = 'CM_Permissions';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      data: data,
      title: this.titleAction,
      entityName: this.view.formModel.entityName,
    };
    this.callfc
      .openForm(
        PopupPermissionsComponent,
        '',
        950,
        650,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event, true).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  //contact


  //#endregion

  //#region event
  selectedChange(data) {
    if (this.dataSelected?.recID != data?.data?.recID) {
      this.dataSelected = data?.data ? data?.data : data;
    }
    this.detectorRef.detectChanges();
  }
  //#endregion


  addressNameCMEmit(e) {
    this.dataSelected.address = e ? e?.address : null;
    this.dataSelected.provinceID = e ? e?.provinceID : null;
    this.dataSelected.districtID = e ? e?.districtID : null;
    this.dataSelected.wardID = e ? e?.wardID : null;
    this.view.dataService.update(this.dataSelected, true).subscribe();
    this.detectorRef.detectChanges();
  }

  // open form covnert deal
  convertCustomerToDeals(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
    }

    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let formModel = new FormModel();
    // hard code
    formModel.funcID = 'CM0201';
    formModel.formName = 'CMDeals';
    formModel.entityName = 'CM_Deals';
    formModel.gridViewName = 'grvCMDeals';
    option.FormModel = formModel;
    option.Width = '800px';
    option.zIndex = 1001;
    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          let customerView = {
            customerID: data.recID,
            dealName: data.customerName,
            industries: data.industries,
            channelID: data.channelID,
            shortName: data.shortName,
            category: data.category,
          };
          let obj = {
            action: 'add',
            formMD: formModel,
            titleAction: this.titleAction,
            processID: null,
            gridViewSetup: res,
            isviewCustomer: true,
            customerView: customerView,
            categoryCustomer: data?.categoryCustomer,
          };
          let dialogCustomDeal = this.callfc.openSide(
            PopupAddDealComponent,
            obj,
            option
          );
          dialogCustomDeal.closed.subscribe((e) => {
            if (e && e.event != null) {
              this.notiService.notifyCode('SYS007');
              //    this.view.dataService.update(e.event).subscribe();
              //   this.detailViewDeal.promiseAllAsync();
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }
}
