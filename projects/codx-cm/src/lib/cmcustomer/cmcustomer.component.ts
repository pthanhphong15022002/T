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
  ButtonModel,
  CacheService,
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
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = '';
  className = '';
  method = '';
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
  // const set value
  readonly btnAdd: string = 'btnAdd';
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.loaded = false;
        // this.view.dataService = JSON.parse(JSON.stringify(this.view.dataService));
        this.funcID = param.funcID;
        this.loadMethod();
        this.isButton = true;
        this.afterLoad();
        this.loaded = true;
      }
    });

    // this.api.execSv<any>('CM','ERM.Business.CM','CustomersBusiness','UpdateStatusCustomersRPAAsync').subscribe(res => {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }

  loadMethod() {
    switch (this.funcID) {
      case 'CM0101':
      case 'CM0105':
        this.method = 'GetListCustomersAsync';
        this.className = 'CustomersBusiness';
        this.entityName = 'CM_Customers';
        if (this.queryParams?.recID) {
          this.predicate = 'RecID=@0';
          this.dataValue = this.queryParams?.recID;
        }
        break;
      case 'CM0102':
        this.method = 'GetListContactAsync';
        this.className = 'ContactsBusiness';
        this.entityName = 'CM_Contacts';
        break;
      case 'CM0103':
        this.method = 'GetListPartnersAsync';
        this.className = 'PartnersBusiness';
        this.entityName = 'CM_Partners';
        this.predicate = '';
        this.dataValue = '';
        break;
      case 'CM0104':
        this.method = 'GetListCompetitorsAsync';
        this.className = 'CompetitorsBusiness';
        this.entityName = 'CM_Competitors';
        this.predicate = '';
        this.dataValue = '';
        break;
    }
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    this.showButtonAdd = true;
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

    this.detectorRef.detectChanges();
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
    let funcID = this.funcID == 'CM0105' ? 'CM0101' : this.funcID;
    this.cache.functionList(funcID).subscribe(async (fun) => {
      var formMD = new FormModel();
      this.entityName = JSON.parse(JSON.stringify(fun?.entityName));
      if (this.funcID == 'CM0101' || this.funcID == 'CM0105') {
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
      }
    });
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        if (this.isButton) this.add();
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
      case 'CM0105_1':
      case 'CM0101_1':
        this.setIsBlackList(data, true);
        break;
      case 'CM0105_3':
      case 'CM0101_3':
        this.setIsBlackList(data, false);
        break;
      case 'CM0102_3':
      case 'CM0105_1':
      case 'CM0102_2':
        this.deleteContactToCM(data);
        break;
      //Cập nhật status
      case 'CM0105_6':
      case 'CM0101_6':
        this.updateStatusCustomer(data.status);
        break;
      //update address
      case 'CM0105_5':
      case 'CM0101_5':
        this.updateAutoAddress(data);
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

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        if (data?.status != '99') {
          switch (res.functionID) {
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
            default:
              break;
          }
        } else {
          switch (res.functionID) {
            case 'CM0105_6':
            case 'CM0101_6':
              res.disabled = false;
              break;
            default:
              res.disabled = true;
              break;
          }
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
            this.view.dataService.update(data).subscribe();
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
              this.customerDetail.getOneCustomerDetail(this.dataSelected);
              this.customerDetail.onChangeContact(lstContact);
              this.customerDetail.onChangeAddress(lstAddress);
              this.view.dataService.update(data).subscribe();
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
            this.funcID == 'CM0101' || this.funcID == 'CM0105'
              ? 'CustomerID'
              : this.funcID == 'CM0102'
              ? 'ContactID'
              : this.funcID == 'CM0103'
              ? 'PartnerID'
              : 'CompetitorID'
          )
          .subscribe((x) => {
            var obj = {
              action: 'copy',
              title: this.titleAction,
              recIdOld: this.dataSelected.recID,
              autoNumber: x,
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
                this.view.dataService.update(data).subscribe();
                // this.customerDetail.loadTag(this.dataSelected);
                this.detectorRef.detectChanges();

                this.detectorRef.detectChanges();
              }
            });
          });
      });
    });
  }

  async delete(data: any) {
    this.view.dataService.dataSelected = data;
    var check = false;
    if (this.funcID == 'CM0101' || this.funcID == 'CM0105') {
      check = await firstValueFrom(
        this.cmSv.checkCustomerIDByDealsAsync(data?.recID)
      );
      if (check) {
        this.notiService.notifyCode('CM009');
        return;
      }
      check = await firstValueFrom(
        this.api.execSv<any>(
          'CM',
          'ERM.Business.CM',
          'ContractsBusiness',
          'IsExitsByContractAsync',
          [data.recID]
        )
      );
      if (check) {
        this.notiService.notifyCode('CM011');
        return;
      }
      check = await firstValueFrom(
        this.api.execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CustomersBusiness',
          'IsExitsByQuotationAsync',
          [data.recID]
        )
      );
      if (check) {
        this.notiService.notifyCode('CM024');
        return;
      }
    }

    if (this.funcID == 'CM0102') {
      check = await firstValueFrom(
        this.api.execSv<any>(
          'CM',
          'ERM.Business.CM',
          'ContactsBusiness',
          'CheckContactDealAsync',
          [data.recID]
        )
      );
      if (check) {
        this.notiService.notifyCode('CM012');
        return;
      }
    }

    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });

    this.detectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteCmAsync';
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
              this.customerDetail.dataSelected = JSON.parse(
                JSON.stringify(this.dataSelected)
              );
              // this.customerDetail.getOneCustomerDetail(this.dataSelected.recID, this.funcID);
              this.view.dataService.update(this.dataSelected).subscribe();
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
  updateAutoAddress(datas = []){
    let lstObjIds = [];
  }

  //contact
  async deleteContactToCM(data) {
    var check = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'ContactsBusiness',
        'CheckContactDealAsync',
        [data.recID]
      )
    );
    if (check) {
      this.notiService.notifyCode('CM012');
      return;
    }
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x?.event?.status == 'Y') {
        if (data.objectID != null && data.objectType != null) {
          if (!data?.contactType.split(';').some((x) => x == '1')) {
            this.cmSv.updateContactCrm(data.recID).subscribe((res) => {
              if (res) {
                this.dataSelected.objectID = null;
                this.dataSelected.contactType = null;
                this.dataSelected.objectType = null;
                this.dataSelected.objectName = null;
                this.view.dataService.update(this.dataSelected).subscribe();
                this.notiService.notifyCode('SYS008');
                this.detectorRef.detectChanges();
              }
            });
          } else {
            this.notiService.notifyCode('CM004');
            return;
          }
        }
      }
    });
  }

  //#endregion

  //#region event
  selectedChange(data) {
    if (this.dataSelected?.recID != data?.data?.recID) {
      this.dataSelected = data?.data ? data?.data : data;
    }
    this.detectorRef.detectChanges();
  }
  //#endregion

  getNameCrm(data) {
    var name = '';
    if (this.funcID == 'CM0101' || this.funcID == 'CM0105') {
      name = data?.customerName;
    } else if (this.funcID == 'CM0102') {
      name = data.contactName;
    } else if (this.funcID == 'CM0103') {
      name = data.partnerName;
    } else {
      name = data.competitorName;
    }
    return name;
  }

  addressNameCMEmit(e) {
    this.dataSelected.address = e ? e?.adressName : null;
    this.dataSelected.provinceID = e ? e?.provinceID : null;
    this.dataSelected.districtID = e ? e?.districtID : null;
    this.dataSelected.wardID = e ? e?.wardID : null;
    this.view.dataService.update(this.dataSelected).subscribe();
    this.detectorRef.detectChanges();
  }
}
