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
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopAddCurrencyComponent } from './pop-add-currency/pop-add-currency.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'lib-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.css','../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFormComponent extends UIComponent {
  //#region Contructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;
  @ViewChild('morefunc') morefunc: TemplateRef<any>;
  gridViewSetup: any;
  funcName: any;
  views: Array<ViewModel> = [];
  itemSelected: any;
  button?: ButtonModel = {
    id: 'btnAdd',
  };;
  headerText = '';
  moreFunction = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private callfunc: CallFuncService
  ) {
    super(inject);
  }

  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit(): void {
    // this.acService
    //   .getFunctionList(this.view.funcID)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res) => {
    //     if (res) this.funcName = res.defaultName;
    //   });
    this.cache.functionList(this.view.funcID)
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
          template2: this.itemTemplate,
        },
      },
    ];
    this.dt.detectChanges();
  }
  //#endregion

  //#region Function
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add(evt);
        break;
    }
  }
  add(e) {
    this.headerText = e.text + ' ' + this.funcName.toLowerCase();
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let dialog = this.callfunc.openSide(
        PopAddCurrencyComponent,
        obj,
        option,
        this.view.funcID
      );
      // dialog.closed.subscribe((x) => {
      //   if (x.event == null) this.view.dataService.clear();
      // });
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
          headerText: e.text + ' ' + this.funcName.toLowerCase(),
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          PopAddCurrencyComponent,
          obj,
          option
        );
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName.toLowerCase(),
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          PopAddCurrencyComponent,
          obj,
          option
        );
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data)
      )
      .subscribe((res: any) => {
        if (res) {
          this.api
            .exec('ERM.Business.BS', 'ExchangeRatesBusiness', 'DeleteAsync', [
              data.currencyID,
            ])
            .subscribe((res: any) => {});
        }
      });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CurrenciesBusiness';
    opt.assemblyName = 'BS';
    opt.service = 'BS';
    opt.data = data;
    return true;
  }
  //#endregion
}
