import { F } from '@angular/cdk/keycodes';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  Injector,
  ChangeDetectorRef,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ButtonModel,
  CodxGridviewComponent,
  SidebarModel,
  CallFuncService,
  CRUDService,
  DialogRef,
  RequestOption,
  CodxGridviewV2Component,
  CodxInputComponent,
  Util,
} from 'codx-core';
import { PostingAccountsAddComponent } from './posting-accounts-add/posting-accounts-add.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'posting-accounts',
  templateUrl: './posting-accounts.component.html',
  styleUrls: [
    './posting-accounts.component.scss',
    '../../codx-ac.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItempostingaccountsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('eleGrid') eleGrid: CodxGridviewV2Component;
  views: Array<ViewModel> = [];
  menuInventory: any;
  menuPurchase: any;
  menuSell: any;
  menuProduction: any;
  vllHeader: any;
  menuActive: any = '1';
  postType: any;
  funcName: any;
  subheaderText: any;
  headerText: any;
  button = [
    {
      id: 'btnAdd',
    },
  ];
  dataDefault: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  isSubView: boolean;
  constructor(private inject: Injector, private callfunc: CallFuncService) {
    super(inject);
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }
  //#endregion Constructor

  //#region Init
  onInit() {
    this.cache.valueList('AC037').subscribe((res) => {
      if (res) {
        this.menuInventory = res?.datas;
        this.postType = res?.datas[0]?.value; //? focus đầu vào item đầu tiên
      }
    });

    this.cache.valueList('AC052').subscribe((res) => {
      if (res) {
        this.menuPurchase = res?.datas;
      }
    });

    this.cache.valueList('AC038').subscribe((res) => {
      if (res) {
        this.menuSell = res?.datas;
      }
    });

    this.cache.valueList('AC053').subscribe((res) => {
      if (res) {
        this.menuProduction = res?.datas;
      }
    });

    this.cache.valueList('AC058').subscribe((res) => {
      if (res) {
        this.vllHeader = res?.datas;
      }
    });
  }

  ngAfterViewInit() {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) this.funcName = res.defaultName;
      });
    this.views = [
      {
        type: ViewType.content,
        sameData: true,
        active: true,
        model: {
          panelLeftRef: this.templateLeft,
          widthLeft: '15%',
          panelRightRef: this.templateRight,
          //collapsed: true
        },
      },
    ];
    console.log(this.view);
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion Init

  //#region Event

  /**
   * *Hàm xử lí click trên toolbar
   * @param e
   */
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e); //? thêm mới tài khoản hạch toán
        break;
    }
  }

  /**
   * *Hàm xử lí click morefunction
   * @param e
   * @param data
   */
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data); //? xóa tài khoản hạch toán
        break;
      case 'SYS03':
        this.edit(e, data); //? chỉnh sửa tài khoản hạch toán
        break;
      case 'SYS04':
        this.copy(e, data); //? sao chép tài khoản hạch toán
        break;
    }
  }

  /**
   * *Hàm xử lí click các menu header (hàng tồn kho,mua hàng,...)
   * @param e
   * @returns
   */
  clickMenu(e: any) {
    if (e === this.menuActive) return;
    switch (e) {
      case '1':
        this.menuActive = '1';
        this.postType = this.menuInventory[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '2':
        this.menuActive = '2';
        this.postType = this.menuPurchase[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '3':
        this.menuActive = '3';
        this.postType = this.menuSell[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '4':
        this.menuActive = '4';
        this.postType = this.menuProduction[0]?.value; //? focus đầu vào item đầu tiên
        break;
    }
    setTimeout(() => {
      if (this.eleGrid) {
        this.eleGrid.refresh();
      }
    }, 100);
  }

  /**
   * *Hàm xử lí click các sub menu con của các header
   * @param value
   * @returns
   */
  clickMenuItem(value: any) {
    if (this.postType == value) return;
    this.postType = value;
    setTimeout(() => {
      this.eleGrid.refresh();
    }, 100);
  }

  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới thiết lập tài khoản hạch toán
   * @param e
   */
  addNew(e) {
    this.view.dataService.addNew().subscribe((res: any) => {
      res.moduleID = this.menuActive;
      res.postType = this.postType;
      this.eleGrid.addRow(res, this.eleGrid.dataSource.length);
    });
    // this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    // this.subheaderText = this.getSubHeader(this.menuActive,this.postType);
    // let data = {
    //   headerText: this.headerText,
    //   subheaderText: this.subheaderText,
    //   dataDefault:{...this.dataDefault},
    //   eleGrid:this.eleGrid
    // };
    // if(!this.dataDefault){
    //   this.view.dataService.addNew().subscribe((res: any) => {
    //     if(res){
    //       res.isAdd = true;
    //       res.moduleID = this.menuActive;
    //       res.postType = this.postType;
    //       this.dataDefault = {...res};
    //       data.dataDefault = {...this.dataDefault};
    //       let dialog = this.callfunc.openSide(
    //         PostingAccountsAddComponent,
    //         data,
    //         this.optionSidebar,
    //         this.view.funcID
    //       );
    //     }
    //   });
    // }else{
    //   data.dataDefault.recID = Util.uid();
    //   data.dataDefault.moduleID = this.menuActive;
    //   data.dataDefault.postType = this.postType;
    //   let dialog = this.callfunc.openSide(
    //     PostingAccountsAddComponent,
    //     data,
    //     this.optionSidebar,
    //     this.view.funcID
    //   );
    // }
  }

  /**
   * *Hàm chỉnh sửa thiết lập tài khoản hạch toán
   * @param e
   * @param dataEdit
   */
  edit(e, dataEdit) {
    // this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    // this.subheaderText = this.getSubHeader(this.menuActive,this.postType);
    // if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    // this.view.dataService
    //   .edit(dataEdit)
    //   .subscribe((res: any) => {
    //     if (res) {
    //       res.isEdit = true;
    //       let data = {
    //         headerText: this.headerText,
    //         subheaderText: this.subheaderText,
    //         dataDefault:{...res},
    //         funcName:this.funcName,
    //         eleGrid:this.eleGrid
    //       };
    //       let dialog = this.callfunc.openSide(
    //         PostingAccountsAddComponent,
    //         data,
    //         this.optionSidebar,
    //         this.view.funcID
    //       );
    //     }
    //   });
  }

  /**
   * *Hàm sao chép thiết lập tài khoản hạch toán
   * @param e
   * @param dataCopy
   */
  copy(e, dataCopy) {
    // this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    // this.subheaderText = this.getSubHeader(this.menuActive,this.postType);
    // if (dataCopy) this.view.dataService.dataSelected = dataCopy;
    // this.view.dataService
    //   .copy()
    //   .subscribe((res: any) => {
    //     if (res) {
    //       res.isCopy = true;
    //       let data = {
    //         headerText: this.headerText,
    //         subheaderText: this.subheaderText,
    //         dataDefault:{...res},
    //         funcName:this.funcName,
    //         eleGrid:this.eleGrid
    //       };
    //       let dialog = this.callfunc.openSide(
    //         PostingAccountsAddComponent,
    //         data,
    //         this.optionSidebar,
    //         this.view.funcID
    //       );
    //     }
    //   });
  }

  /**
   * *Hàm xóa thiết lập tài khoản hạch toán
   * @param dataDelete
   */
  delete(dataDelete) {
    this.eleGrid.deleteRow(dataDelete);
  }

  /**
   * *Hàm lấy tên subhearder
   * @param valueHeader
   * @param valueItem
   * @returns
   */
  getSubHeader(valueHeader, valueItem) {
    let textheader;
    let textitem;
    if (this.vllHeader.find((x) => x.value == valueHeader)) {
      textheader = this.vllHeader.find((x) => x.value == valueHeader)?.text;
    }
    switch (valueHeader) {
      case '1':
        if (this.menuInventory.find((x) => x.value == valueItem)) {
          textitem = this.menuInventory.find((x) => x.value == valueItem)?.text;
        }
        break;
      case '2':
        if (this.menuPurchase.find((x) => x.value == valueItem)) {
          textitem = this.menuPurchase.find((x) => x.value == valueItem)?.text;
        }
        break;
      case '3':
        if (this.menuSell.find((x) => x.value == valueItem)) {
          textitem = this.menuSell.find((x) => x.value == valueItem)?.text;
        }
        break;
      case '4':
        if (this.menuProduction.find((x) => x.value == valueItem)) {
          textitem = this.menuProduction.find(
            (x) => x.value == valueItem
          )?.text;
        }
        break;
    }
    return textheader + ' > ' + textitem;
  }

  //#endregion Function
}
