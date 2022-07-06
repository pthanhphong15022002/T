import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NotificationsService } from 'codx-core';
import { RequestOption } from 'codx-core';
import { ButtonModel, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType, CallFuncService } from 'codx-core';
import { BS_Ranges } from '../../models/BS_Ranges.model';
import { PopAddRangesComponent } from './pop-add-ranges/pop-add-ranges.component';

@Component({
  selector: 'lib-ranges-kanban',
  templateUrl: './ranges-kanban.component.html',
  styleUrls: ['./ranges-kanban.component.css']
})
export class RangesKanbanComponent implements OnInit {
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;
  @ViewChild("itemRangeID", { static: true }) itemRangeID: TemplateRef<any>;
  @ViewChild("itemRangeName", { static: true }) itemRangeName: TemplateRef<any>;
  @ViewChild("itemNote", { static: true }) itemNote: TemplateRef<any>;
  @ViewChild("itemRange", { static: true }) itemRange: TemplateRef<any>;
  @ViewChild("itemCreatedBy", { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild("itemCreatedOn", { static: true }) itemCreatedOn: TemplateRef<any>;

  @ViewChild('view') view!: ViewsComponent;
  dialog!: DialogRef;

  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  views: Array<ViewModel> = [];
  itemSelected: any;
  constructor(private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
  ) { }

  //#region Init
  ngOnInit(): void {
    this.columnsGrid = [
      {  width: 200, headerTemplate: this.itemRangeID  },
      {  width: 250, headerTemplate: this.itemRangeName },
      {  width: 200 , headerTemplate: this.itemNote},
      {  width: 200, headerTemplate: this.itemRange },
      {  width: 200, headerTemplate: this.itemCreatedBy },
      { width: 150, headerTemplate: this.itemCreatedOn },
      { field: '', headerText: '#', width: 30 },

    ];
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
        template: this.grid,
      }
    }];
    this.view.dataService.methodSave = '';
    this.view.dataService.methodDelete = '';

  }
  //#endregion

  //#region CRUD Methods
  add() {
    this.view.dataService.addNew(0).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px'; 

      this.dialog = this.callfunc.openSide(PopAddRangesComponent, null, option);

    });

    this.dialog.closed.subscribe((x) => {
      if (x.event == null)
        this.view.dataService
          .remove(this.view.dataService.dataSelected)
          .subscribe(x => {
            this.dt.detectChanges();
          });
      else {
        this.view.dataService.update(x.event).subscribe();
        this.view.dataService.setDataSelected(x.event);
      }
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopAddRangesComponent, null, option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], this.beforeDel).subscribe();
  };

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0][0];
    opt.methodName = 'DeleteRangesKanbanAsync';

    opt.data = itemSelected.rangeID;
    return true;
  }
  //#endregion

  //#region Functions
  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }
  requestEnded(evt: any) {
    this.dialog && this.dialog.close();
  }
  aaa(val: any) {
    console.log(val);
  }
  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.dt.detectChanges();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
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
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
  //#endregion
}
