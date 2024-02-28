import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  UIComponent,
  ViewType,
  CallFuncService,
  SidebarModel,
  Util,
} from 'codx-core';
import { AccountsAddComponent } from './accounts-add/accounts-add.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-accounts',
  templateUrl: 'accounts.component.html',
  styleUrls: ['accounts.component.css', '../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent extends UIComponent {
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
    private callfunc: CallFuncService,
    private acService: CodxAcService
  ) {
    super(inject);
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }
  //#endregion Contructor

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
        sameData: false,
        model: {
          template2: this.templateGrid,
        },
      },
    ];
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
          AccountsAddComponent,
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
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    this.view.dataService.edit(dataEdit).subscribe((res: any) => {
      if (res) {
        res.isEdit = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
          funcName: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          AccountsAddComponent,
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
    if (dataCopy) this.view.dataService.dataSelected = dataCopy;
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        res.isCopy = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
          funcName: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          AccountsAddComponent,
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
      if (res) {
        this.acService.clearCache('account');
      }
    });
  }

  changeDataMF(event, type: any = '') {
    event.reduce((pre, element) => {
      if (type === 'views') element.isbookmark = true;
      if (!['SYS03', 'SYS02', 'SYS04', 'SYS002'].includes(element.functionID))
        element.disabled = true;
    }, {});
  }

  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }

  //#endregion Function
}
