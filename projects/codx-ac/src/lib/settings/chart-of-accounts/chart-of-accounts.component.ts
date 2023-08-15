import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  CacheService,
  UIComponent,
  ViewType,
  DialogRef,
  CallFuncService,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { PopAddAccountsComponent } from './pop-add-accounts/pop-add-accounts.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.css','../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartOfAccountsComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  columnsGrid = [];
  headerText: any;
  dialog: DialogRef;
  private destroy$ = new Subject<void>();
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  //#region Contructor
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private acService: CodxAcService,
  ) {
    super(inject);
    this.dialog = this.dialog;
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    // this.acService
    //   .getFunctionList(this.view.funcID)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res) => {
    //     if (res) this.funcName = res.defaultName;
    //   });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: false,
        model: {
          resources: this.columnsGrid,
          template2: this.templateMore,
          
        },
      },
    ];
    this.dt.detectChanges();
    // this.view.dataService.methodSave = 'AddAsync';
    // this.view.dataService.methodUpdate = 'EditAsync';
    // this.view.dataService.methodDelete = 'DeleteAsync';
  }

  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
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
  //#endregion

  //#region Function
  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopAddAccountsComponent,
        obj,
        option,
        this.view.funcID
      );
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
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddAccountsComponent,
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
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddAccountsComponent,
          obj,
          option
        );
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {});
  }
  //#endregion
}
