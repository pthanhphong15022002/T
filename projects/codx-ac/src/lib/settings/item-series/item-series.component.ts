import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { Button } from '@syncfusion/ej2-angular-buttons';
import { ButtonModel, CallFuncService, DialogRef, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddItemSeriesComponent } from './pop-add-item-series/pop-add-item-series.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-item-series',
  templateUrl: './item-series.component.html',
  styleUrls: ['./item-series.component.css']
})
export class ItemSeriesComponent extends UIComponent {

  //Constructor

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd'
  }];
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any = '';
  gridViewSetup: any;
  private destroy$ = new Subject<void>()
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

    this.cache.functionList(this.view?.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.funcName = res.defaultName.toLowerCase();
      });
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
    }
  }

  //End Event

  //Function

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
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddItemSeriesComponent,
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
          PopAddItemSeriesComponent,
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
          PopAddItemSeriesComponent,
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

  hideMoreFunction(e: any) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'SYS003' ||
        x.functionID == 'SYS004'
    );
    bm.forEach((morefunction) => {
      morefunction.disabled = true;
    });
  }
  //End Function
}
