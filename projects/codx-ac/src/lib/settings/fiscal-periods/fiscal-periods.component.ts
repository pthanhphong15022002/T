import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CallFuncService, DialogModel, DialogRef, FormModel, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddFiscalPeriodsComponent } from './pop-add-fiscal-periods/pop-add-fiscal-periods.component';
import { FiscalPeriodsAutoCreateComponent } from './fiscal-periods-add/fiscal-periods-auto-create.component';

@Component({
  selector: 'lib-fiscal-periods',
  templateUrl: './fiscal-periods.component.html',
  styleUrls: ['./fiscal-periods.component.css']
})
export class FiscalPeriodsComponent extends UIComponent{
  
  //Constructor

  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any = 'danh mục kỳ tài chính';
  gridViewSetup: any;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }

  //End Constructor

  //Init
  
  onInit(): void {
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
  }

  //End Init

  //Event

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
      case 'ACS25301':
        this.openFormAddFiscalYear();
        break;
    }
  }

  //End Event

  //Function

  add(e) {
    console.log(this.view.dataService);
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddFiscalPeriodsComponent,
        obj,
        option,
        this.view.funcID
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event == null) this.view.dataService.clear();
      });
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
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddFiscalPeriodsComponent,
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
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddFiscalPeriodsComponent,
          obj,
          option
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
    });
  }

  openFormAddFiscalYear() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'FiscalPeriodsAutoCreate';
    dataModel.gridViewName = 'grvFiscalPeriodsAutoCreate';
    dataModel.entityName = 'AC_FiscalPeriodsAutoCreate';
    opt.FormModel = dataModel;
    opt.DataService = this.view.dataService;
    this.cache
      .gridViewSetup('FiscalPeriodsAutoCreate', 'grvFiscalPeriodsAutoCreate')
      .subscribe((res) => {
        if (res) {
          var obj = {
            gridViewSetup: res,
          };
          var dialogs = this.callfc.openForm(
            FiscalPeriodsAutoCreateComponent,
            '',
            400,
            600,
            '',
            obj,
            '',
            opt
          );
        }
      });
  }

  hideMoreFunction(e: any)
  {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'SYS003' ||
        x.functionID == 'SYS004'
    );
    bm.forEach((morefunction) => {
      morefunction.disabled = true;
    });

    this.cache.moreFunction('FiscalPeriods', 'grvFiscalPeriods')
    .subscribe((res: any) => {
      if(res)
      {
        console.log(res);
      }
    })
  }
  //End Function
}
