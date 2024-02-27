import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import {
  CodxAcService,
  fmItemsProduction,
  fmItemsPurchase,
  fmItemsSales,
} from '../../codx-ac.service';
import { toCamelCase } from '../../utils';
import { Subject, takeUntil } from 'rxjs';
import { ItemsAddComponent } from './items-add/items-add.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
      icon: 'icon-i-box-seam',
    },
  ];
  funcName = '';
  headerText: any;
  optionSidebar: SidebarModel = new SidebarModel();
  fmItemsPurchase: any = fmItemsPurchase;
  fmItemsSales: any = fmItemsSales;
  fmItemsProduction: any = fmItemsProduction;
  fgItemsPurchase: FormGroup;
  fgItemsSales: FormGroup;
  fgItemsProduction: FormGroup;
  private destroy$ = new Subject<void>();
  isSubView: boolean;

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private acService: CodxAcService
  ) {
    super(inject);
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.fgItemsPurchase = this.codxService.buildFormGroup(
      this.fmItemsPurchase.formName,
      this.fmItemsPurchase.gridViewName,
      this.fmItemsPurchase.entityName
    );

    this.fgItemsSales = this.codxService.buildFormGroup(
      this.fmItemsSales.formName,
      this.fmItemsSales.gridViewName,
      this.fmItemsSales.entityName
    );

    this.fgItemsProduction = this.codxService.buildFormGroup(
      this.fmItemsProduction.formName,
      this.fmItemsProduction.gridViewName,
      this.fmItemsProduction.entityName
    );
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
        type: ViewType.grid,
        active: true,
        sameData: false,
        model: {
          template2: this.templateGrid,
        },
      },
    ];

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.Width = '800px';
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event
  /**
   * *Hàm xử lí thêm mới tài khoản
   * @param e
   */
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e);
        break;
    }
  }

  /**
   * *Hàm xử lí chỉnh sửa,copy,xóa tài khoản
   * @param e
   * @param data
   */
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
  //#endregion Event

  //#region Function

  /**
   * *Hàm them moi hang hoa
   * @param e
   */
  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    let data: any = {
      headerText: this.headerText,
      fgItemsPurchase: this.fgItemsPurchase,
      fgItemsSales: this.fgItemsSales,
      fgItemsProduction: this.fgItemsProduction,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      if (res) {
        res.isAdd = true;
        data.dataDefault = res;
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          this.optionSidebar,
          this.view.funcID
        );
        // dialog.closed.subscribe((res) => {
        //   if (res.event == null) {
        //     if(data.dataDefault?.itemID?.trim() == '' || data.dataDefault?.itemID?.trim() == undefined) return;
        //     this.view.dataService
        //       .delete([data.dataDefault], false,null,null,null,null,null,false)
        //       .pipe(takeUntil(this.destroy$))
        //       .subscribe((res: any) => { });
        //   }
        // });
      }
    });
  }

  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) {
      this.view.dataService.dataSelected = dataEdit;
    }
    this.view.dataService.edit(dataEdit).subscribe((res: any) => {
      if (res) {
        res.isEdit = true;
        let data: any = {
          headerText: this.headerText,
          fgItemsPurchase: this.fgItemsPurchase,
          fgItemsSales: this.fgItemsSales,
          fgItemsProduction: this.fgItemsProduction,
          dataDefault: { ...res },
        };
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          this.optionSidebar,
          this.view.funcID
        );
      }
    });
  }

  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) {
      this.view.dataService.dataSelected = dataCopy;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        res.isCopy = true;
        let data: any = {
          headerText: this.headerText,
          fgItemsPurchase: this.fgItemsPurchase,
          fgItemsSales: this.fgItemsSales,
          fgItemsProduction: this.fgItemsProduction,
          dataDefault: res,
        };
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          this.optionSidebar,
          this.view.funcID
        );
      }
    });
  }

  delete(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }
  //#endregion Function
}
