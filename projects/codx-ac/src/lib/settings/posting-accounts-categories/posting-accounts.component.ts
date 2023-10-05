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
  vllHeader:any;
  menuActive: any = '1';
  postType: any;
  funcName: any;
  subheaderText: any;
  headerText: any;
  button = {
    id: 'btnAdd',
  };
  dataDefault:any;
  optionSidebar: SidebarModel = new SidebarModel();
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(private inject: Injector, private callfunc: CallFuncService) {
    super(inject);
  }
  //#endregion

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

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.Width = '550px';
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion;
  clickMenu(e: any) {
    if (e === this.menuActive) return;
    switch (e) {
      case '1':
        this.menuActive = 1;
        this.postType = this.menuInventory[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '2':
        this.menuActive = 2;
        this.postType = this.menuPurchase[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '3':
        this.menuActive = 3;
        this.postType = this.menuSell[0]?.value; //? focus đầu vào item đầu tiên
        break;
      case '4':
        this.menuActive = 4;
        this.postType = this.menuProduction[0]?.value; //? focus đầu vào item đầu tiên
        break;
    }
    setTimeout(() => {
      if (this.eleGrid) {
        this.eleGrid.refresh();
      }
    }, 100);
  }

  clickMenuItem(value: any) {
    if (this.postType == value) return;
    this.postType = value;
    setTimeout(() => {
      this.eleGrid.refresh();
    }, 100);
  }

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e);
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
  
  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.subheaderText = this.getSubHeader(this.menuActive,this.postType);
    let data = {
      headerText: this.headerText,
      subheaderText: this.subheaderText,
      dataDefault:{...this.dataDefault}
    };
    if(!this.dataDefault){
      this.view.dataService.addNew().subscribe((res: any) => {
        if(res){
          res.isAdd = true;
          this.dataDefault = {...res};
          data.dataDefault = {...this.dataDefault};
          let dialog = this.callfunc.openSide(
            PostingAccountsAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }       
      });
    }else{
      let dialog = this.callfunc.openSide(
        PostingAccountsAddComponent,
        data,
        this.optionSidebar,
        this.view.funcID
      );
    }
    // this.loadMenuActive(this.menuActive);
    // this.headerText = e.text + ' ' + this.funcName;
    // this.view.dataService.addNew().subscribe((res: any) => {
    //   var obj = {
    //     formType: 'add',
    //     headerText: this.headerText,
    //     subheaderText: this.subheaderText,
    //     moduleID: this.menuActive,
    //     postType: this.postType,
    //   };
    //   let option = new SidebarModel();
    //   option.DataService = this.view.dataService;
    //   option.FormModel = this.view.formModel;
    //   option.Width = '550px';
    //   this.dialog = this.callfunc.openSide(
    //     PostingAccountsAddComponent,
    //     obj,
    //     option,
    //     this.view.funcID
    //   );
    //   this.dialog.closed.subscribe((x) => {
    //     if (x.event == null) this.view.dataService.clear();
    //   });
    // });
  }
  edit(e, data) {
    // this.loadMenuActive(parseInt(data.moduleID));
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .edit(this.view.dataService.dataSelected)
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'edit',
    //       headerText: e.text + ' ' + this.funcName,
    //       subheaderText: this.subheaderText,
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '550px';
    //     this.dialog = this.callfunc.openSide(PostingAccountsAddComponent, obj, option);
    //   });
  }
  copy(e, data) {
    // this.loadMenuActive(parseInt(data.moduleID));
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .copy()
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'copy',
    //       headerText: e.text + ' ' + this.funcName,
    //       subheaderText: this.subheaderText,
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '550px';
    //     this.dialog = this.callfunc.openSide(PostingAccountsAddComponent, obj, option);
    //   });
  }
  delete(data) {
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .delete([data], true, (option: RequestOption) =>
    //     this.beforeDelete(option, data)
    //   )
    //   .subscribe((res: any) => {});
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'IVPostingAccountsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data.recID;
    return true;
  }

  getSubHeader(valueHeader,valueItem){
    let textheader;
    let textitem;
    if (this.vllHeader.find(x => x.value == valueHeader)) {
      textheader = (this.vllHeader.find(x => x.value == valueHeader))?.text;
    }
    switch(valueHeader){
      case '1':
        if (this.menuInventory.find(x => x.value == valueItem)) {
          textitem = (this.menuInventory.find(x => x.value == valueItem))?.text;
        }
        break;
    }
    return textheader + ' > ' + textitem
  }
}
