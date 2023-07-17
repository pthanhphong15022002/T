import {
  Component,
  ElementRef,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { ActivatedRoute } from '@angular/router';
import { CodxAcService } from '../../codx-ac.service';
import { PopAddReceiptTransactionComponent } from './pop-add-receipt-transaction/pop-add-receipt-transaction.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { VouchersLines } from '../../models/VouchersLines.model';

@Component({
  selector: 'lib-receipt-transaction',
  templateUrl: './receipt-transaction.component.html',
  styleUrls: ['./receipt-transaction.component.css'],
})
export class ReceiptTransactionComponent extends UIComponent {
  //#region Constructor

  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  funcName: any;
  parentID: string;
  journalNo: string;
  totalacct: any = 0;
  totaloff: any = 0;
  totalQuantity: any = 0;
  totalAmt: any = 0;
  width: any;
  height: any;
  innerWidth: any;
  itemSelected: any;
  objectname: any;
  oData: any;
  lsVatCode: any;
  entityName: any;
  receiptsFormName: string = 'VouchersReceipts';
  receiptsGrvName: string = 'grvVouchersReceipts';
  issuesFormName: string = 'VouchersIssues';
  issuesGrvName: string = 'grvVouchersIssues';
  funcID: any;
  acctTrans: any;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  overflowed: boolean = false;
  expanding: boolean = false;
  isLoadDataAcct: any = true;
  fmVouchers: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: 'IV_Vouchers',
  };
  fmVouchersLines: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: 'IV_VouchersLines',
  };
  vouchersLines: Array<VouchersLines> = [];
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  fmAccTrans: FormModel = {
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  parent: any;
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });
    this.funcID = this.routerActive.snapshot.params['funcID'];
    switch (this.funcID) {
      case 'ACT0708':
        this.cache.moreFunction(this.receiptsFormName, this.receiptsGrvName).subscribe((res: any) => {
          if (res && res.length) {
            let m = res.find((x) => x.functionID == 'ACT070801');
            if (m)
            {
              this.fmVouchers.formName = m.formName;
              this.fmVouchers.gridViewName = m.gridViewName;
            }

            let n = res.find((x) => x.functionID == 'ACT070800');
            if (n) this.funcName = n.defaultName;

            let o = res.find((x) => x.functionID == 'ACT070802');
            if(o)
            {
              this.fmVouchersLines.formName = 'VouchersLinesReceipts';
              this.fmVouchersLines.gridViewName = 'grvVouchersLinesReceipts';
            }
          }
        });
        break;
      case 'ACT0714':
        this.cache.moreFunction(this.issuesFormName, this.issuesGrvName).subscribe((res: any) => {
          if (res && res.length) {
            let m = res.find((x) => x.functionID == 'ACT071401');
            if (m)
            {
              this.fmVouchers.formName = m.formName;
              this.fmVouchers.gridViewName = m.gridViewName;
            }

            let n = res.find((x) => x.functionID == 'ACT071400');
            if (n) this.funcName = n.defaultName;

            let o = res.find((x) => x.functionID == 'ACT071402');
            if(o)
            {
              this.fmVouchersLines.formName = 'VouchersLinesIssues';
              this.fmVouchersLines.gridViewName = 'grvVouchersLinesIssues';
            }
          }
        });
        break;
    }
  }
  //#endregion

  //#region Init

  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    this.view.setRootNode(this.parent?.customName);
  }

  ngOnDestroy() {
    this.view.setRootNode('');
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }
  //#endregion

  //#region Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
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
    }
  }

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method

  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }
  add(e) {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(o))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'add',
            headerText: this.headerText,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }
  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'edit',
            headerText: this.funcName,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
          this.dialog.closed.subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.itemSelected = res.event['data'];
                this.loadDatadetail(this.itemSelected);
              }
            }
          });
        }
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'copy',
            headerText: this.funcName,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {});
  }
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
  //#endregion

  //#region Function

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'VouchersBusiness';
    opt.assemblyName = 'IV';
    opt.service = 'IV';
    opt.data = data;
    return true;
  }
  loadDatadetail(data) {
    this.acctTrans = [];
    this.api
      .exec('IV', 'VouchersLinesBusiness', 'LoadDataAsync', [
        data.recID,
      ])
      .subscribe((res: any) => {
        this.vouchersLines = res;
        this.loadTotal();
      });
    this.api
      .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', 'e973e7b7-10a1-11ee-94b4-00155d035517')
      // .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
      .subscribe((res: any) => {
        this.acctTrans = res;
        this.loadAcctTransTotal();
        this.isLoadDataAcct = false;
      });
  }
  changeItemDetail(event) {
    if (event?.data == null)
      return;
    if (event?.data.data || event?.data.error) {
      return;
    } else {
      if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
        return;
      } else {
        this.isLoadDataAcct = true;
        this.itemSelected = event?.data;
        this.loadDatadetail(this.itemSelected);
      }
    }
    this.expanding = false;
  }

  clickChange(data) {
    this.itemSelected = data;
    this.loadDatadetail(data);
  }

  changeDataMF() {
    this.itemSelected = this.view.dataService.dataSelected;
    this.loadDatadetail(this.itemSelected);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  loadTotal(){
    this.totalAmt = 0;
    this.totalQuantity = 0;
    this.vouchersLines.forEach((item) => {
      if(item)
      {
        this.totalQuantity += item.quantity;
        this.totalAmt += item.costAmt;
      }
    });
  }

  loadAcctTransTotal() {
    this.totalacct = 0;
    this.totaloff = 0;
    for (let index = 0; index < this.acctTrans.length; index++) {
      if (!this.acctTrans[index].crediting) {
        this.totalacct = this.totalacct + this.acctTrans[index].transAmt;
      } else {
        this.totaloff = this.totaloff + this.acctTrans[index].transAmt;
      }
    }
  }

  createLine(item) {
    if (item.crediting) {
      var data = this.acctTrans.filter((x) => x.entryID == item.entryID);
      let index = data
        .filter((x) => x.crediting == item.crediting)
        .findIndex((x) => x.recID == item.recID);
      if (
        index ==
        data.filter((x) => x.crediting == item.crediting).length - 1
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  //#endregion
}
