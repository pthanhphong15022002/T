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
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  dataObj?: any;
  columnGrids = [];
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  funcID = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Customers';
  className = 'CustomersBusiness';
  method = 'GetListCRMAsync';
  idField = 'recID';
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  isButton = true;
  gridViewSetup: any;
  lstCustGroups = [];
  // const set value
  readonly btnAdd: string = 'btnAdd';
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cmSv: CodxCmService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }
  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    this.showButtonAdd = true;
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
    ];

    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        // this.view.dataService = JSON.parse(JSON.stringify(this.view.dataService));
        this.funcID = param.funcID;
        this.isButton = true;
        this.afterLoad();
      }
    });
  }
  ngAfterViewInit(): void {
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
    // this.entityName =
    //   this.funcID == 'CM0101'
    //     ? 'CM_Customers'
    //     : this.funcID == 'CM0102'
    //     ? 'CM_Contacts'
    //     : this.funcID == 'CM0103'
    //     ? 'CM_Partners'
    //     : 'CM_Competitors';
    this.cache.functionList(this.funcID).subscribe(async (fun) => {
      var formMD = new FormModel();
      this.entityName = JSON.parse(JSON.stringify(fun?.entityName));
      // formMD.entityName = JSON.parse(JSON.stringify(fun?.entityName));
      // formMD.formName = JSON.parse(JSON.stringify(fun?.formName));
      // formMD.gridViewName = JSON.parse(JSON.stringify(fun?.gridViewName));
      // formMD.funcID = JSON.parse(JSON.stringify(fun?.funcID));
      // this.view.formModel = formMD;
      if (this.funcID == 'CM0101') {
        this.lstCustGroups = await firstValueFrom(this.api.execSv<any>('CM','ERM.Business.CM','CustomerGroupsBusiness','GetListDealCompetitorsAsync'));
        this.cache
          .gridViewSetup(fun?.formName, fun?.gridViewName)
          .subscribe((res) => {
            if (res) {
              this.gridViewSetup = res;
            }
          });
      }
    });

    this.detectorRef.detectChanges();
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
        if (this.isButton) this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        if (this.isButton) this.copy(data);
        break;
      case 'CM0101_1':
        this.setIsBlackList(data, true);
        break;
      case 'CM0101_3':
        this.setIsBlackList(data, false);
        break;
      case 'CM0102_3':
      case 'CM0102_2':
        this.deleteContactToCM(data);
        break;
      //tạm ngưng
      case 'CM0101_4':
        this.updateStatusCustomer('99', data);
        break;
      //mở lại
      case 'CM0101_5':
        this.updateStatusCustomer('2', data);
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
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = false;
            break;
          case 'SYS003':
          case 'SYS004':
          case 'SYS002':
          case 'CM0102_4':
          case 'CM0102_1':
            res.disabled = true;
            break;
          case 'CM0101_1':
            if (data.isBlackList) res.disabled = true;
            break;
          case 'CM0101_3':
            if (!data.isBlackList) res.disabled = true;
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
            if (data.status === '99') res.disabled = true;
            break;
          case 'CM0101_5':
            if (data.status !== '99') res.disabled = true;
            break;
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

        this.cmSv
          .getAutonumber(
            this.funcID,
            fun.entityName,
            this.funcID == 'CM0101'
              ? 'CustomerID'
              : this.funcID == 'CM0102'
              ? 'ContactID'
              : this.funcID == 'CM0103'
              ? 'PartnerID'
              : 'CompetitorID'
          )
          .subscribe((x) => {
            var obj = {
              action: 'add',
              title: this.titleAction,
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
                e.event.modifiedOn = new Date();
                this.dataSelected = JSON.parse(JSON.stringify(e?.event));
                this.view.dataService.update(e?.event).subscribe();

                this.detectorRef.detectChanges();
                // this.customerDetail.listTab(this.funcID);
              }
            });
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
              e.event.modifiedOn = new Date();
              this.view.dataService.update(e.event).subscribe();
              this.dataSelected = JSON.parse(JSON.stringify(e?.event));
              this.customerDetail.getOneCustomerDetail(this.dataSelected);
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
            this.funcID == 'CM0101'
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
                e.event.modifiedOn = new Date();
                this.dataSelected = JSON.parse(JSON.stringify(e?.event));
                this.view.dataService.update(e.event).subscribe();
                // this.dataSelected = JSON.parse(
                //   JSON.stringify(this.view.dataService.data[0])
                // );

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
    if (this.funcID == 'CM0101') {
      check = await firstValueFrom(
        this.cmSv.checkCustomerIDByDealsAsync(data?.recID)
      );
      if (check) {
        this.notiService.notifyCode('CM009');
        return;
      } else {
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

    // this.cmSv.checkCustomerIDByDealsAsync(data?.recID).subscribe((res) => {
    //   if (res) {
    //     this.notiService.notifyCode(
    //       'Đang tồn tại trong cơ hội, không được xóa'
    //     );
    //     return;
    //   } else {
    //     this.view.dataService
    //       .delete([this.view.dataService.dataSelected], true, (opt) =>
    //         this.beforeDel(opt)
    //       )
    //       .subscribe((res) => {
    //         if (res) {
    //           this.view.dataService.onAction.next({
    //             type: 'delete',
    //             data: data,
    //           });
    //         }
    //       });
    //   }
    // });
    // } else {
    //   this.view.dataService
    //     .delete([this.view.dataService.dataSelected], true, (opt) =>
    //       this.beforeDel(opt)
    //     )
    //     .subscribe((res) => {
    //       if (res) {
    //         this.view.dataService.onAction.next({
    //           type: 'delete',
    //           data: data,
    //         });
    //       }
    //     });
    // }

    this.detectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteCmAsync';
    opt.data = [itemSelected.recID, this.funcID, this.entityName];
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

  async updateStatusCustomer(status, data) {
    var check = false;
    check = await firstValueFrom(this.api.execSv<any>('CM','ERM.Business.CM','DealsBusiness','IsExitDealStatusByCustomerIDAsync', data?.recID));
    if(check){
      this.notiService.notifyCode('CM020');
      return;
    }
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService
      .alertCode(
        'CM007',
        null,
        this.titleAction?.toLocaleLowerCase(),
        "'" + data?.customerName + "'"
      )
      .subscribe((x) => {
        if (x?.event?.status == 'Y') {
          this.cmSv.updateStatusCustoemr(data.recID, status).subscribe((res) => {
            if (res) {
              this.dataSelected.status = status;
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
    if (this.funcID == 'CM0101') {
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
    this.dataSelected.address = e;
    this.view.dataService.update(this.dataSelected).subscribe();
    this.detectorRef.detectChanges();
  }
}
