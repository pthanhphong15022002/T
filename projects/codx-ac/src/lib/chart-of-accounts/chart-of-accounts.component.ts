import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  CacheService,
  UIComponent,
  ViewType,
  DialogRef,
  CallFuncService,
  SidebarModel,
} from 'codx-core';
import { PopAddAccountsComponent } from './pop-add-accounts/pop-add-accounts.component';

@Component({
  selector: 'lib-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.css'],
})
export class ChartOfAccountsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  moreFuncName = '';
  headerText :any;
  dialog: DialogRef;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService
    ) {
    super(inject);
  }
  //#region Constructor

  //#region Init
  onInit(): void {
    this.api.exec<any>('GL','TestBusiness','Get').subscribe(res=>{
      console.log(res)
    })
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) {
        this.funcName = res.defaultName;
        console.log(this.funcName);
      }
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          frozenColumns: 1,
          template2: this.templateMore,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddAsync';
    this.view.dataService.methodUpdate = 'EditAsync';
  }

  //#region Init

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete();
        break;
    }
    this.edit();
  }

  //#endregion

  //#region Function
  add() {
    console.log(this.view);
    this.headerText = "Thêm tài khoản";
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '850px';
      this.dialog = this.callfunc.openSide(PopAddAccountsComponent, obj, option,this.view.funcID);
      this.dialog.closed.subscribe((x) => {
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe(x => {
              this.dt.detectChanges();
            });
      });
    });
  }

  edit() {}

  delete() {}
  //#endregion
}
