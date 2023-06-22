import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { PopAddCashComponent } from './pop-add-cash/pop-add-cash.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';
import { CodxAcService } from '../../codx-ac.service';
import { SettledInvoices } from '../../models/SettledInvoices.model';
import { map } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';
@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css'],
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('accountRef') accountRef: ElementRef;
  dialog!: DialogRef;
  button?: ButtonModel = {
    id: 'btnAdd',
    icon: 'icon-i-card-heading',
    text: 'Thêm phiếu chi',
  };
  headerText: any;
  moreFuncName: any;
  funcName: any;
  journalNo: string;
  itemSelected: any;
  objectname: any;
  oData: any;
  cashbook: any;
  userID: any;
  dataCategory: any;
  journal: IJournal;
  approval: any;
  totalacct: any;
  totaloff: any;
  className: any;
  classNameLine: any;
  entityName: any;
  settledInvoices: any;
  acctTrans: any;
  baseCurr: any;
  cashbookName: any;
  reasonName: any;
  arrEntryID = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmSettledInvoices: FormModel = {
    formName: 'SettledInvoices',
    gridViewName: 'grvSettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  //Bo
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  parent: any;
  authStore: AuthStore;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) {
            this.view.setRootNode(res?.customName);
          }
        });
      }
    });
    this.cache.companySetting().subscribe((res) => {
      this.baseCurr = res.filter((x) => x.baseCurr != null)[0].baseCurr;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.userID = this.authStore.get().userID;
    this.loadjounal();
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
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
        active: true,
        sameData: true,
        model: {
          frozenColumns: 1,
          template2: this.templateMore,
        },
      },
    ];
    switch (this.view.funcID) {
      case 'ACT0429':
      case 'ACT0410':
        this.classNameLine = 'CashPaymentsLinesBusiness';
        this.entityName = 'AC_CashPayments';
        this.className = 'CashPaymentsBusiness';
        break;
      case 'ACT0428':
      case 'ACT0401':
        this.classNameLine = 'CashReceiptsLinesBusiness';
        this.entityName = 'AC_CashReceipts';
        this.className = 'CashReceiptsBusiness';
        break;
    }
    //this.view.setRootNode(this.parent?.customName);

    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.view.setRootNode('');
  }
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
      case 'SYS002':
        this.export(data);
        break;
      case 'ACT041002':
        this.release(data);
        break;
      case 'ACT041004':
        this.cancelRelease(data);
        break;
      case 'ACT041009':
        this.checkValidate(data);
        break;
      case 'ACT041003':
        this.post(data);
        break;
    }
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', this.className, 'SetDefaultAsync', [
      this.journal,
    ]);
  }

  add() {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(o))
      .subscribe((res: any) => {
        var obj = {
          formType: 'add',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
        );
        this.dialog.closed.subscribe((res) => {
          if (res.event != null) {
            if (res.event['update']) {
              this.itemSelected = res.event['data'];
              this.loadDatadetail(this.itemSelected);
              this.view.dataService.update(this.itemSelected).subscribe();
            }
          }
        });
      });
  }

  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
        );
        this.dialog.closed.subscribe((res) => {
          if (res.event != null) {
            if (res.event['update']) {
              this.itemSelected = res.event['data'];
              this.loadDatadetail(this.itemSelected);
              this.view.dataService.update(this.itemSelected).subscribe();
            }
          }
        });
      });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {});
  }
  //#endregion

  //#region Function
  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CashPaymentsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data;
    return true;
  }

  changeDataMF(e: any, data: any) {
    //Bookmark
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // ghi sổ
        x.functionID == 'ACT041002' || // gửi duyệt
        x.functionID == 'ACT041004' || // hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || // khôi phục
        x.functionID == 'ACT042901' || // chuyển tiền điện tử
        x.functionID == 'ACT041010' || // in
        x.functionID == 'ACT041009' // kiểm tra tính hợp lệ
    );
    if (bm.length > 0) {
      switch (data?.status) {
        case '0':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041009' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041003' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041002' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '2':
        case '4':
          bm.forEach((element) => {
            element.disabled = true;
          });
          break;
        case '3':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041004' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041008' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
      }
      // check có hay ko duyệt trước khi ghi sổ
      // if (data?.status == '1') {
      //   if (this.approval == '0') {
      //     bm.forEach((element) => {
      //       element.disabled = true;
      //     });
      //   } else {
      //     bm[1].disabled = true;
      //     bm[2].disabled = true;
      //   }
      // }
      // //Chờ duyệt
      // if (data?.approveStatus == '3' && data?.createdBy == this.userID) {
      //   bm[1].disabled = true;
      //   bm[0].disabled = true;
      // }
      // //hủy duyệt
      // if (data?.approveStatus == '4' || data?.status == '0') {
      //   for (var i = 0; i < bm.length; i++) {
      //     bm[i].disabled = true;
      //   }
      // }
    }
  }

  changeItemDetail(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
          return;
        } else {
          this.itemSelected = event?.data;
          this.loadDatadetail(this.itemSelected);
        }
      }
    }
  }

  loadDatadetail(data) {
    switch (data.subType) {
      case '5':
      case '2':
        this.api
          .exec('AC', 'SettledInvoicesBusiness', 'LoadDataAsync', [data.recID])
          .subscribe((res: any) => {
            this.settledInvoices = res;
            //this.loadTotal();
          });
        break;
    }
    this.api
      .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
      .subscribe((res: any) => {
        this.acctTrans = res;
        this.loadTotal();
      });
    this.loadCashbookName(this.itemSelected);
    // this.loadReasonName(this.itemSelected);
  }

  release(data: any) {
    this.acService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            '',
            '',
            ''
          )
          .subscribe((result) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              this.notification.notifyCode('ES007');
              data.status = '3';
              this.itemSelected = { ...data };
              this.loadDatadetail(this.itemSelected);
              this.view.dataService.update(data).subscribe((res) => {});
              this.detectorRef.detectChanges();
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  cancelRelease(data: any) {
    this.shareService
      .codxCancel('AC', data?.recID, this.view.formModel.entityName, '')
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          this.notification.notifyCode('SYS034');
          data.status = '1';
          this.itemSelected = { ...data };
          this.loadDatadetail(this.itemSelected);
          this.view.dataService.update(data).subscribe((res) => {});
          this.detectorRef.detectChanges();
        } else this.notification.notifyCode(result?.msgCodeError);
      });
  }

  checkValidate(data: any) {
    this.view.dataService.updateDatas.set(data['_uuid'], data);
    this.view.dataService.save().subscribe((res: any) => {
      if (res && res.update.data != null) {
        this.itemSelected = res.update.data;
        this.loadDatadetail(this.itemSelected);
        this.view.dataService.update(this.itemSelected).subscribe();
      }
    });
  }

  post(data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'PostAsync', [data])
      .subscribe((res: any) => {});
  }

  loadjounal() {
    this.api
      .exec<any>('AC', 'JournalsBusiness', 'GetJournalAsync', [this.journalNo])
      .subscribe((res) => {
        this.journal = res[0];
      });
  }

  loadTotal() {
    var totalacct = 0;
    var totaloff = 0;
    for (let index = 0; index < this.acctTrans.length; index++) {
      if (!this.acctTrans[index].crediting) {
        totalacct = totalacct + this.acctTrans[index].transAmt;
      } else {
        totaloff = totaloff + this.acctTrans[index].transAmt;
      }
    }
    this.totalacct = totalacct.toLocaleString('it-IT');
    this.totaloff = totaloff.toLocaleString('it-IT');
  }

  loadCashbookName(data) {
    this.api
      .exec('AC', 'CashBookBusiness', 'LoadDataAsync')
      .subscribe((res: any) => {
        for (let index = 0; index < res.length; index++) {
          if (res[index].cashBookID == data.cashBookID) {
            this.cashbookName = res[index].cashBookName;
          }
        }
      });
  }

  // loadReasonName(data) {
  //   this.api
  //     .exec('AC', 'CommonBusiness', 'GetReasonName', [data])
  //     .subscribe((res: any) => {
  //       this.reasonName = res;
  //     });
  // }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  createLine(item) {
    var data = this.acctTrans.filter((x) => x.entryID == item.entryID);
    let index = data
      .filter((x) => x.crediting == item.crediting)
      .findIndex((x) => x.recID == item.recID);
    if (index == data.filter((x) => x.crediting == item.crediting).length - 1) {
      return true;
    } else {
      return false;
    }
  }
  //#endregion
}
