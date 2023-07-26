import {
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddQuotationsComponent } from './popup-add-quotations/popup-add-quotations.component';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'lib-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css'],
})
export class QuotationsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  //temGird
  @ViewChild('templateCreatedBy') templateCreatedBy: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateCustomer') templateCustomer: TemplateRef<any>;
  @ViewChild('templateTotalSalesAmt') templateTotalSalesAmt: TemplateRef<any>;
  @ViewChild('templateTotalAmt') templateTotalAmt: TemplateRef<any>;
  @ViewChild('templateTotalTaxAmt') templateTotalTaxAmt: TemplateRef<any>;
  @ViewChild('templateCreatedOn') templateCreatedOn: TemplateRef<any>;
  @ViewChild('popDetail') popDetail!: TemplateRef<any>;
  @ViewChild('templateDetailGird') templateDetailGird: TemplateRef<any>;
  @ViewChild('templateDeal') templateDeal: TemplateRef<any>;
  @ViewChild('templateApproverStatus') templateApproverStatus: TemplateRef<any>;

  @Input() funcID: string;
  @Input() customerID: string;
  views: Array<ViewModel> = [];
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Quotations';
  className = 'QuotationsBusiness';
  methodLoadData = 'GetListQuotationsAsync';

  //test
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup: any;
  vllStatus = '';
  vllApprove = '';
  formModel: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
  customerIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];
  predicates = '';
  dataValues = '';
  columnGrids: any;
  arrFieldIsVisible = [];
  itemSelected: any;
  button?: ButtonModel;
  titleAction = '';
  dataSource = [];
  isNewVersion = false;
  popupView: DialogRef;
  viewType: any;
  paramDefault: any;
  currencyIDDefault = 'VND';
  exchangeRateDefault = 1;

  constructor(
    private inject: Injector,
    private codxCM: CodxCmService,
    private codxShareService: CodxShareService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private routerActive: ActivatedRoute,
    private codxCmService: CodxCmService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.funcID = this.routerActive.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.loadSetting();
  }

  ngAfterViewInit() {
    // this.loadSetting();
    // this.views = [
    //   {
    //     type: ViewType.listdetail,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       template: this.itemTemplate,
    //       panelRightRef: this.templateDetail,
    //     },
    //   },
    //   {
    //     type: ViewType.grid,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       template2: this.templateMore,
    //       frozenColumns: 1,
    //     },
    //   },
    // ];
  }

  async loadSetting() {
    this.cache.viewSettingValues('CMParameters').subscribe((res) => {
      if (res?.length > 0) {
        let dataParam = res.filter((x) => x.category == '1' && !x.transType)[0];
        if (dataParam) {
          this.paramDefault = JSON.parse(dataParam.dataValue);
          this.currencyIDDefault =
            this.paramDefault['DefaultCurrency'] ?? 'VND';
          this.exchangeRateDefault = 1; //cai nay chua hop ly neu exchangeRateDefault nos tinh ti le theo dong tien khac thi sao ba
          if (this.currencyIDDefault != 'VND') {
            let day = new Date();
            this.codxCM
              .getExchangeRate(this.currencyIDDefault, day)
              .subscribe((res) => {
                if (res && res != 0) this.exchangeRateDefault = res;
                else {
                  this.currencyIDDefault = 'VND';
                  this.exchangeRateDefault = 1;
                }
              });
          }
        }
      }
    });
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue;
    this.vllApprove = this.grvSetup['ApproveStatus'].referedValue;
    //lay grid view
    let arrField = Object.values(this.grvSetup).filter((x: any) => x.isVisible);
    if (Array.isArray(arrField)) {
      this.arrFieldIsVisible = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map((x: any) => x.fieldName);
      this.getColumsGrid(this.grvSetup);
    }
  }

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'Status':
          template = this.templateStatus;
          break;
        case 'CustomerID':
          template = this.templateCustomer;
          break;
        case 'CreatedBy':
          template = this.templateCreatedBy;
          break;
        case 'TotalTaxAmt':
          template = this.templateTotalTaxAmt;
          break;
        case 'TotalAmt':
          template = this.templateTotalAmt;
          break;
        case 'TotalSalesAmt':
          template = this.templateTotalSalesAmt;
          break;
        case 'CreatedOn':
          template = this.templateCreatedOn;
          break;
        case 'DealID':
          template = this.templateDeal;
          break;
        case 'ApproveStatus':
          template = this.templateApproverStatus;
          break;
        default:
          break;
      }
      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
          // textAlign: 'center',
        };
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnGrids.push(colums);
    });

    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  click(e) {
    this.titleAction = e.text;
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  selectedChange(val: any) {
    if (!val?.data) return;
    this.itemSelected = val?.data;
    this.detectorRef.detectChanges();
  }

  // moreFunc
  onActions(e) {
    switch (e.type) {
      case 'dbClick':
        if (e?.data?.rowData) this.viewDetail(e?.data?.rowData);
        break;
    }
  }
  eventChangeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  changeDataMFGird(e, data) {
    this.changeDataMF(e, data, 11);
  }
  changeDataMF(e, data, type = 1) {
    if (e != null && data != null) {
      e.forEach((res) => {
        if (type == 11) {
          res.isbookmark = false;
        }
        switch (res.functionID) {
          case 'CM0202_1':
            if (data.status != '0' && data.status != '4') {
              res.disabled = true;
            }
            break;
          case 'CM0202_2':
            if (data.status != '1') {
              res.disabled = true;
            }
            break;
          case 'CM0202_3':
            if (data.status != '2') {
              res.isblur = true;
            }
            break;
          case 'CM0202_4':
            if (data.status < 2) {
              res.isblur = true;
            }
            break;
          case 'CM0202_5':
            if (type != 11) {
              res.disabled = true;
            } else res.disabled = false;
            break;
          //da duyet hoac huy thi ko cho edit
          case 'SYS03':
            if (
              data.status == '2' ||
              data.status == '4' ||
              data.approveStatus == '0' ||
              data.approveStatus == '5'
            ) {
              res.disabled = true;
            }
            break;
        }
      });
    }
  }

  clickMoreFunction(e) {
    this.clickMF(e.e, e.data);
  }
  clickMF(e, data) {
    this.titleAction = e.text;
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'CM0202_1':
        this.approvalTrans(data);
        break;
      case 'CM0202_2':
        this.cancelApprover(data);
        break;
      case 'CM0202_3':
        this.createContract(data);
        break;
      case 'CM0202_4':
        this.createNewVersion(data);
        break;
      case 'CM0202_5':
        this.viewDetail(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this
        );
        this.detectorRef.detectChanges();
        break;
      }
    }
  }
  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }

  // region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      this.openPopup(res);
      // if (!res.quotationsID) {
      //   this.api
      //     .execSv<any>(
      //       'SYS',
      //       'AD',
      //       'AutoNumbersBusiness',
      //       'GenAutoNumberAsync',
      //       [this.formModel.funcID, this.formModel.entityName, 'QuotationID']
      //     )
      //     .subscribe((id) => {
      //       res.quotationID = id;
      //       this.openPopup(res);
      //     });
      // } else this.openPopup(res);
    });
  }

  openPopup(res) {
    res.versionNo = res.versionNo ?? 'V1';
    res.revision = res.revision ?? 0;
    res.versionName = res.versionNo + '.' + res.revision;
    // res.status = res.status ?? '0';
    res.exchangeRate = res.exchangeRate ?? this.exchangeRateDefault;
    res.totalAmt = res.totalAmt ?? 0;
    res.currencyID = res.currencyID ?? this.currencyIDDefault;

    var obj = {
      data: res,
      disableDealID: false,
      action: 'add',
      headerText: this.titleAction,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let dialog = this.callfc.openForm(
      PopupAddQuotationsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
    }
    this.view.dataService.edit(data).subscribe((res) => {
      var obj = {
        data: this.view.dataService.dataSelected,
        action: 'edit',
        headerText: this.titleAction,
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let dialog = this.callfc.openForm(
        PopupAddQuotationsComponent,
        '',
        null,
        null,
        '',
        obj,
        '',
        option
      );
      if (this.isNewVersion) this.isNewVersion = false;
    });
  }

  copy(data) {
    let copyToRecID = data.recID;
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      if (this.isNewVersion) {
        res.revision = data.revision;
        res.versionNo = data.versionNo;
        res.versionName = data.versionName;
        res.status = '0';
        res.approveStatus = '1';
        res.approvedDate = null;
        res.refID = data.recID;
      }

      var obj = {
        data: res,
        action: 'copy',
        headerText: this.titleAction,
        copyToRecID: copyToRecID,
        isNewVersion: this.isNewVersion,
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let dialog = this.callfc.openForm(
        PopupAddQuotationsComponent,
        '',
        null,
        null,
        '',
        obj,
        '',
        option
      );

      dialog.closed.subscribe((e) => {
        if (this.isNewVersion) this.isNewVersion = false;
      });
    });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data.recID)
      )
      .subscribe((res: any) => {
        if (res) {
        }
      });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteQuotationsByRecIDAsync';
    opt.className = 'QuotationsBusiness';
    opt.assemblyName = 'CM';
    opt.service = 'CM';
    opt.data = data;
    return true;
  }

  // end region CRUD
  getIndex(recID) {
    return (
      this.view.dataService.data.findIndex((obj) => obj.recID == recID) + 1
    );
  }

  //function More
  // tạo phiên bản mới
  createNewVersion(data) {
    this.isNewVersion = true;
    let dt = JSON.parse(JSON.stringify(data));
    switch (dt.status) {
      case '4':
      case '2':
        dt.versionNo =
          dt.versionNo[0] + (Number.parseInt(dt.versionNo.slice(1)) + 1);
        dt.revision = 0;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        dt.revision = 0;
        this.copy(dt);
        break;
      case '3':
        dt.status = '0';
        dt.revision += 1;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        this.edit(dt);
        break;
    }
  }

  // tạo hợp đồng
  createContract(dt) {
    //viet vao day thuan
  }
  // end

  viewDetail(data) {
    this.itemSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.popupView = this.callfc.openForm(
      this.popDetail,
      '',
      0,
      0,
      '',
      null,
      '',
      option
    );
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    this.codxCmService.getDeals(dt.dealID).subscribe((deals) => {
      if (deals) {
        this.codxCmService.getProcess(deals.processID).subscribe((process) => {
          if (process) {
            this.codxCmService
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res) => {
                if (!res) {
                  this.notiService.notifyCode('ES028');
                  return;
                }

                if (res.eSign) {
                  //kys soos
                } else {
                  this.release(dt, res.processID);
                }
              });
          } else {
            this.notiService.notifyCode('DP040');
          }
        });
      } else {
        this.notiService.notify(
          'Cơ hội không tồn tại hoặc đã bị xóa ! Vui lòng liên hê "Khanh" để xin messcode',
          '3'
        );
      }
    });
  }
  //Gửi duyệt
  release(data: any, processID: any) {
    this.codxShareService
      .codxRelease(
        this.view.service,
        data?.recID,
        processID,
        this.view.formModel.entityName,
        this.view.formModel.funcID,
        '',
        data?.title,
        ''
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) this.notiService.notify(res2?.msgCodeError);
        else {
          this.codxCM
            .getOneObject(this.itemSelected.recID, 'QuotationsBusiness')
            .subscribe((q) => {
              if (q) {
                this.itemSelected = q;
                this.view.dataService.update(this.itemSelected).subscribe();
              }
              this.notiService.notifyCode('ES007');
            });
        }
      });
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.codxCmService.getProcess(dt.processID).subscribe((process) => {
          if (process) {
            this.codxCmService
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res2: any) => {
                if (res2) {
                  if (res2?.eSign == true) {
                    //trình ký
                  } else if (res2?.eSign == false) {
                    //kí duyet
                    this.codxShareService
                      .codxCancel(
                        'CM',
                        dt?.recID,
                        this.view.formModel.entityName,
                        null,
                        null
                      )
                      .subscribe((res3) => {
                        if (res3) {
                          this.itemSelected.approveStatus = '0';
                          this.codxCmService
                            .updateApproveStatus(
                              'QuotationsBusiness',
                              dt?.recID,
                              '0'
                            )
                            .subscribe();
                          this.notiService.notifyCode('SYS007');
                        } else this.notiService.notifyCode('SYS021');
                      });
                  }
                }
              });
          } else {
            this.notiService.notifyCode('DP040');
          }
        });
      }
    });
  }
  //end duyet
  //--------------------------------------------------------------------//
}
