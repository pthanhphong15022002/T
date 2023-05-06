import { copy } from '@syncfusion/ej2-angular-spreadsheet';
import { AddEditComponent } from './addEdit/addEdit.component';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NotificationsService, UIComponent } from 'codx-core';
import { RequestOption } from 'codx-core';
import {
  ButtonModel,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { title } from 'process';

@Component({
  selector: 'lib-ranges-kanban',
  templateUrl: './ranges-kanban.component.html',
  styleUrls: ['./ranges-kanban.component.css'],
})
export class RangesKanbanComponent extends UIComponent {
  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;
  @ViewChild('itemRangeID', { static: true }) itemRangeID: TemplateRef<any>;
  @ViewChild('itemRangeName', { static: true }) itemRangeName: TemplateRef<any>;
  @ViewChild('itemNote', { static: true }) itemNote: TemplateRef<any>;
  @ViewChild('itemRange', { static: true }) itemRange: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  dialog!: DialogRef;
  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  views: Array<ViewModel> = [];
  itemSelected: any;
  funcName: any;
  moreFuncName: any;
  constructor(private injector: Injector) {
    super(injector);
  }

  //#region Init
  onInit(): void {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
    this.columnsGrid = [
      { width: 200, headerTemplate: this.itemRangeID },
      { width: 250, headerTemplate: this.itemRangeName },
      { width: 200, headerTemplate: this.itemNote },
      { width: 200, headerTemplate: this.itemRange },
      { width: 200, headerTemplate: this.itemCreatedBy },
      { width: 150, headerTemplate: this.itemCreatedOn },
      { field: '', headerText: '#', width: 30 },
    ];
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });

    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          resources: this.columnsGrid,
          template: this.grid,
        },
      },
    ];
    this.view.dataService.methodSave = '';
    this.view.dataService.methodDelete = '';
  }
  //#endregion

  //#region CRUD Methods
  add() {
    let title = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        AddEditComponent,
        ['add', title],
        option
      );
    });
  }

  edit(e, data?) {
    let title = e.text + ' ' + this.funcName;
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddEditComponent,
          ['edit', title],
          option
        );

        this.dialog.closed.subscribe((x) => {
          this.view.dataService.clear();
        });
      });
  }

  copy(e, data) {
    this.view.dataService.dataSelected = data;
    let title = e.text + ' ' + this.funcName;
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        AddEditComponent,
        ['add', title],
        option
      );
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe();
  }
  //#endregion

  //#region Functions
  changeView(evt: any) {}

  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.detectorRef.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
  //#endregion

  //#region Events
  buttonClick(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  moreFuncClick(e: any, data?: any) {
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
  //#endregion
}
