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

@Component({
  selector: 'lib-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css'],
})
export class QuotationsComponent extends UIComponent {
  @Input() funcID: string;
  @Input() customerID: string;
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
  formModel: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
  customerIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];
  predicates = 'RefType==@0 && RefID==@1';
  dataValues = '';
  columnGrids: any;
  arrFieldIsVisible = [];
  itemSelected: any;
  button?: ButtonModel;
  titleAction = '';
  dataSource = [];
  isNewVersion = false;

  constructor(
    private inject: Injector,
    private codxCM: CodxCmService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);

  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit() {
    this.loadSetting();
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
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue;
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
    this.itemSelected = val?.data;
    this.detectorRef.detectChanges();
  }

  // moreFunc
  eventChangeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'CM0202_1':
            if (data.status != 0) {
              res.disabled = true;
            }
            break;
          case 'CM0202_2':
            if (data.status != 1) {
              res.disabled = true;
            }
            break;
          case 'CM0202_3':
          case 'CM0202_4':
            if (data.status < 2) {
              res.isblur = true;
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
        this.sendApprover(data);
        break;
      case 'CM0202_2':
        this.rejectApprove(data);
        break;
      case 'CM0202_3':
        this.createNewVersion(data);
        break;
      case 'CM0202_4':
        this.createNewVersion(data);
        break;
    }
  }

  // region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      if (!res.quotationsID) {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'AutoNumbersBusiness',
            'GenAutoNumberAsync',
            [this.formModel.funcID, this.formModel.entityName, 'QuotationsID']
          )
          .subscribe((id) => {
            res.quotationID = id;
            this.openPopup(res);
          });
      } else this.openPopup(res);
    });
  }

  openPopup(res) {
    res.versionNo = res.versionNo ?? 'V1';
    res.revision = res.revision ?? 0;
    res.versionName = res.versionNo + '.' + res.revision;
    res.status = res.status ?? '0';
    res.exchangeRate = res.exchangeRate ?? 1;
    res.totalAmt = res.totalAmt ?? 0;
    res.currencyID = res.currencyID ?? 'VND';

    var obj = {
      data: res,
      disableRefID: false,
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
      this.view.dataService.dataSelected = data;
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
    });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
      .subscribe((res) => {
        if (this.isNewVersion) {
          res.revision = data.revision;
          res.revisionNo = data.revisionNo;
          res.revisionName = data.revisionName;
        }
        var obj = {
          data: res,
          action: 'copy',
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
  //gửi duyệt
  sendApprover(dt) {
    //test
    dt.status = '1';
    this.itemSelected.status = '1';
    this.view.dataService.update(this.itemSelected).subscribe();
    this.itemSelected = JSON.parse(
      JSON.stringify(this.view.dataService.dataSelected)
    );
  }

  // tạo phiên bản mới
  createNewVersion(dt) {
    this.isNewVersion = true;
    switch (dt.status) {
      case '4':
      case '2':
        dt.versionNo =
          dt.versionNo[0] + (Number.parseInt(dt.versionNo.slice(1)) + 1);
        dt.revision = 0;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        this.copy(dt);
        break;
      case '3':
        dt.revision += 1;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        this.edit(dt);
        break;
    }
  }

  //huy yêu cầu duyệt
  rejectApprove(dt) {
    //test
    dt.status = '0';
    this.itemSelected.status = '0';
    this.view.dataService.update(this.itemSelected).subscribe();
    this.itemSelected = JSON.parse(
      JSON.stringify(this.view.dataService.dataSelected)
    );

    // ES016 - Hủy
    let processNo;
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        //check truoc ben quy trình có thiết lập chưa ?? cos la lam tiep
        this.codxCM
          .getESCategoryByCategoryID(processNo)
          .subscribe((res2: any) => {
            if (res2) {
              //trình ký
              if (res2?.eSign == true) {
                // this.cancelAproval(item);
                //this.callfunc.openForm();
              } else if (res2?.eSign == false) {
                this.codxCM
                  .cancelSubmit(dt?.recID, this.view.formModel.entityName)
                  .subscribe((res3) => {
                    if (res3) {
                      this.itemSelected.status = '0';
                      this.codxCM
                        .updateStatusQuotatitons([this.itemSelected.recID, '0'])
                        .subscribe((res4) => {
                          if (res4.status == 0) {
                            this.view.dataService
                              .update(this.itemSelected)
                              .subscribe();
                            this.notiService.notifyCode('SYS007');
                          } else this.notiService.notifyCode('SYS021');
                        });
                    } else this.notiService.notifyCode('SYS021');
                  });
              }
            }
          });
      }
    });
  }

  //cance ki so

  //end trình ký

  // tạo hợp đồng
  createContract(dt) {
    //viet vao day thuan
  }
  // end
}
