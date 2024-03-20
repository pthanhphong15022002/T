import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map, takeUntil, tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';
import { FixedAssetAddComponent } from './fixed-asset-add/fixed-asset-add.component';
import { toCamelCase } from '../../utils';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-fixed-assets',
  templateUrl: './fixed-assets.component.html',
  styleUrls: ['./fixed-assets.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class FixedAssetsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  funcName = '';
  headerText: any;
  itemSelected: any;
  private destroy$ = new Subject<void>();
  constructor(
    injector: Injector, 
    private acService: CodxAcService,
    private callfunc: CallFuncService,
    ) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {}

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
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e); //? thêm mới tài khoản
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
        this.delete(data); //? xóa tài khoản
        break;
      case 'SYS03':
        this.edit(e, data); //? chỉnh sửa tài khoản
        break;
      case 'SYS04':
        this.copy(e, data); //? copy tài khoản
        break;
    }
  }
  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.addNew().subscribe((res: any) => {
      if (res) {
        res.isAdd = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          FixedAssetAddComponent,
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
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          FixedAssetAddComponent,
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
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          FixedAssetAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm xóa tài khoản
   * @param dataDelete
   */
  delete(dataDelete) {
    if (dataDelete) this.view.dataService.dataSelected = dataDelete;
    this.view.dataService.delete([dataDelete], true).subscribe((res: any) => {
      if (this.view.dataService.data.length == 0) {
        this.itemSelected = undefined;
        this.detectorRef.detectChanges();
      }
    });
  }

  changeDataMF(event, type: any = '') {
    this.acService.changeMFCategories(event, type);
  }

  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
