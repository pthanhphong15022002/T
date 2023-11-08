import {
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  RequestOption,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-importeinvoices',
  templateUrl: './importeinvoices.component.html',
  styleUrls: ['./importeinvoices.component.css'],
})
export class ImportEInvoicesComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  button?: ButtonModel = { id: 'btnAdd' };
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
  @ViewChild('xml', { read: ElementRef }) private xml: ElementRef;

  itemSelected: any;
  baseCurr: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  headerText: any;
  runmode: any;
  selectedFirst = true;

  moreFuncs: Array<ButtonModel> = [
    {
      id: 'btnImportXml',
      icon: '',
      text: 'Đọc file xml',
    },
  ];
  constructor(inject: Injector) {
    super(inject);
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr; //? get đồng tiền hạch toán
        }
      });
  }
  //#endregion

  //#region Init
  onInit() {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.listdetail, //? thiết lập view danh sách chi tiết
        active: true,
        sameData: true,
        model: {
          template: this.templateDetailLeft,
          panelRightRef: this.templateDetailRight,
          collapsed: true,
          widthLeft: '25%',
          //separatorSize:3
        },
      },
      {
        type: ViewType.grid_detail, //? thiết lập view lưới
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,

        },

        request:{service:'AC'},
        subModel:{
          entityName:'AC_PurchaseInvoicesLines',
          formName:'PurchaseInvoicesLines',
          gridviewName:'grvPurchaseInvoicesLines',
          parentField:'TransID',
          parentNameField:'InvoiceNo',
          hideMoreFunc:true,
          request:{
            service: 'AC',
          },
          idField:'recID'
        }
      },
    ];
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.headerText = res?.customName; //? lấy tên chứng từ (Phiếu chi)
          this.runmode = res?.runMode; //? lấy runmode
        }
      });
  }
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add(e);
        break;
      case 'btnImportXml':
        this.xml.nativeElement.click();
        break;
    }
  }

  onSelectedItem(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        this.itemSelected = event?.data;
        this.detectorRef.detectChanges();
      }
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //  this.delete(data);
        break;
      case 'SYS03':
        //  this.edit(e, data);
        break;
      case 'SYS04':
        // this.copy(e, data);
        break;
    }
  }
  //#endregion

  //#region Function
  /**read xml from input file */
  scanMail() {
    let st = new Date('2023-01-01');
    let ed = new Date('2023-10-01');
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ScanXMLFromMail', ['', st, ed])
      .subscribe();
  }

  async readXml(event: any) {
    const input = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = (e.target.result as string).split('base64,')[1];
      this.view.dataService.addDatas.set(Util.uid(), {});
      this.view.dataService
        .save(
          (o: RequestOption) => {
            o.service = 'AC';
            o.assemblyName = 'AC';
            o.className = 'PurchaseInvoicesBusiness';
            o.methodName = 'ReadXmlAsync';
            o.data = bytes;
            return true;
          },
          0,
          '',
          '',
          false
        )
        .subscribe((res) => {
          this.view.dataService.clear();
        });
    };
    reader.readAsDataURL(input);
  }
  //#endregion
}
