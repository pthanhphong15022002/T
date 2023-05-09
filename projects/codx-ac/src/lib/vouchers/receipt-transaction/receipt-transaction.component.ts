import { Component, Injector, Optional, TemplateRef, ViewChild} from '@angular/core';
import { AuthStore, ButtonModel, CallFuncService, DataRequest, DialogRef, FormModel, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { InventoryJournals } from '../../models/InventoryJournals.model';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { ActivatedRoute } from '@angular/router';
import { CodxAcService } from '../../codx-ac.service';
import { PopAddReceiptTransactionComponent } from './pop-add-receipt-transaction/pop-add-receipt-transaction.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { InventoryJournalLines } from '../../models/InventoryJournalLines.model';

@Component({
  selector: 'lib-receipt-transaction',
  templateUrl: './receipt-transaction.component.html',
  styleUrls: ['./receipt-transaction.component.css']
})
export class ReceiptTransactionComponent extends UIComponent{
  
  //#region Constructor

  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  funcName: any;
  parentID: string;
  journalNo: string;
  width: any;
  height: any;
  innerWidth: any;
  itemSelected: any;
  objectname: any;
  oData: any;
  page: any = 1;
  pageSize = 5;
  itemName: any;
  lsVatCode: any;
  gridViewLines: any;
  fmInventoryJournalLines: FormModel = {
    formName: 'InventoryJournalLines',
    gridViewName: 'grvInventoryJournalLines',
    entityName: 'IV_InventoryJournalLines',
  };
  inventoryJournalLines: Array<InventoryJournalLines> = [];
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
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
    this.cache
      .gridViewSetup('InventoryJournalLines', 'grvInventoryJournalLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewLines = res;
        }
      });
  }
  //#endregion

  //#region Init

  onInit(): void {
    this.api
      .exec('IV', 'ItemsBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.itemName = res;
        }
      });
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
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
    }
  }
  //#endregion

  //#region Method

  setDefault(o) {
    return this.api.exec('IV', 'InventoryJournalsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }
  add(e) {
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
          PopAddReceiptTransactionComponent,
          obj,
          option,
          this.view.funcID
        );
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
          PopAddReceiptTransactionComponent,
          obj,
          option,
          this.view.funcID
        );
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
          PopAddReceiptTransactionComponent,
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
  
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'InventoryJournalsBusiness';
    opt.assemblyName = 'IV';
    opt.service = 'IV';
    opt.data = data;
    return true;
  }
  loadDatadetail(data) {
    this.api
      .exec('IV', 'InventoryJournalLinesBusiness', 'LoadDataAsync', [data.recID])
      .subscribe((res: any) => {
        this.inventoryJournalLines = res;
      });
    if(data.warehouseID)
    {
      this.api.exec('IV', 'InventoryJournalsBusiness', 'GetWarehouseNameAsync', [data.warehouseID])
      .subscribe((res: any) => {
        this.itemSelected.warehouseName = res;
      });
    }
  }
  changeItemDetail(event) {
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

  clickChange(data) {
    this.itemSelected = data;
    this.loadDatadetail(data);
  }

  changeDataMF() {
    this.itemSelected = this.view.dataService.dataSelected;
    this.loadDatadetail(this.itemSelected);
  }

  formatDate(date){
    return new Date(date).toLocaleDateString();;
  }
  //#endregion
}
