import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CurrencyAddComponent } from './currency-add/currency-add.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'lib-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css', '../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  funcName: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel[] = [
    {
      id: 'btnAdd',
      icon: 'icon-attach_money',
    },
  ];
  headerText: any;
  dataDefault: any;
  itemSelected: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  isSubView: boolean;
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private callfunc: CallFuncService
  ) {
    super(inject);
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }

  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.funcName = res.defaultName;
      });

    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
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
   * *Hàm click toolbar
   * @param evt
   */
  toolBarClick(evt: any) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew(evt); //? thêm mới tiền tệ
        break;
    }
  }

  /**
   * *Hàm xử lí click (sửa,xóa,copy)
   * @param e
   * @param data
   */
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(e, data); //? chỉnh sửa tiền tệ
        break;
      case 'SYS02':
        this.delete(data); //? xóa tiền tệ
        break;
      case 'SYS04':
        this.copy(e, data); //? sao chép tiền tệ
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới tiền tệ
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
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          CurrencyAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm chỉnh sửa tiền tệ
   * @param e
   * @param dataEdit
   */
  edit(e, dataEdit) {
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    this.view.dataService.edit(dataEdit).subscribe((res: any) => {
      if (res) {
        res.isEdit = true;
        this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
          funcName: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          CurrencyAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm sao chép tiền tệ
   * @param e
   * @param dataCopy
   */
  copy(e, dataCopy) {
    if (dataCopy) this.view.dataService.dataSelected = dataCopy;
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        res.isCopy = true;
        this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
          funcName: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          CurrencyAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }

  /**
   * *Hàm xóa tiền tệ
   * @param dataDelete
   */
  delete(dataDelete) {
    if (dataDelete) this.view.dataService.dataSelected = dataDelete;
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
  //#endregion
}
