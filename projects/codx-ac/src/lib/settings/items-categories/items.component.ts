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
  fmItemsPurchase: any = fmItemsPurchase;
  fmItemsSales: any = fmItemsSales;
  fmItemsProduction: any = fmItemsProduction;
  fgItemsPurchase: FormGroup;
  fgItemsSales: FormGroup;
  fgItemsProduction: FormGroup;
  itemSelected:any;
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
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.view.dataService.addNew().subscribe((res: any) => {
      if (res) {
        res.isAdd = true;
        let data: any = {
          headerText: this.headerText,
          dataDefault: { ...res },
          fgItemsPurchase: this.fgItemsPurchase,
          fgItemsSales: this.fgItemsSales,
          fgItemsProduction: this.fgItemsProduction,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
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
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) this.view.dataService.dataSelected = dataCopy;
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
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ItemsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  delete(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && !res?.error) {
          if (this.view.dataService.data.length == 0) {
            this.itemSelected = undefined;
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  changeDataMF(event, type: any = '') {
    this.acService.changeMFCategories(event,type);
  }

  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }
  //#endregion Function
}
