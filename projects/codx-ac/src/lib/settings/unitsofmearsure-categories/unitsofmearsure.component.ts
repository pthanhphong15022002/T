import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { UnitsOfMearSureAdd } from './unitsofmearsure-add/unitsofmearsure-add.component';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-unitsofmearsure',
  templateUrl: './unitsofmearsure.component.html',
  styleUrls: ['./unitsofmearsure.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsofmearsureComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  funcName = '';
  itemSelected: any;
  headerText: any;
  private destroy$ = new Subject<void>();
  isSubView: boolean;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
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

  /**
   * *Hàm xử lí thêm mới tài khoản
   * @param e
   */
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
  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới tài khoản
   * @param e
   */
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
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          UnitsOfMearSureAdd,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm chỉnh sửa tài khoản
   * @param e
   * @param dataEdit
   */
  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) {
      this.view.dataService.dataSelected = dataEdit;
    }
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
          UnitsOfMearSureAdd,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm sao chép chỉnh sửa
   * @param e
   * @param dataCopy
   */
  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) {
      this.view.dataService.dataSelected = dataCopy;
    }
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
          UnitsOfMearSureAdd,
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
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
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
