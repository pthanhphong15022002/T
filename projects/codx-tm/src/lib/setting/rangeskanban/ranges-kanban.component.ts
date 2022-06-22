import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType, CallFuncService } from 'codx-core';
import { PopAddRangesComponent } from './pop-add-ranges/pop-add-ranges.component';

@Component({
  selector: 'lib-ranges-kanban',
  templateUrl: './ranges-kanban.component.html',
  styleUrls: ['./ranges-kanban.component.css']
})
export class RangesKanbanComponent implements OnInit {
  @ViewChild("itemCreateBy", { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild("GiftIDCell", { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild("itemCreate", { static: true }) itemCreateOn: TemplateRef<any>;
  @ViewChild("itemListReadmore", { static: true }) itemListReadmore: TemplateRef<any>;
  @ViewChild("itemNote", { static: true }) itemNote: TemplateRef<any>;

  @ViewChild('view') view!: ViewsComponent;
  dialog!: DialogRef;

  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  views: Array<ViewModel> = [];
  itemSelected: any;
  constructor(private dt: ChangeDetectorRef,
    private callfunc: CallFuncService) { }

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'rangeID', headerText: 'Mã', width: 200 },
      { field: 'rangeName', headerText: 'Mô tả', width: 250 },
      { field: 'note', headerText: 'Ghi chú', width: 200, template: this.itemNote },
      { field: 'rangeID', headerText: 'Khoảng thời gian', template: this.itemListReadmore, width: 200 },
      { field: 'createdBy', headerText: 'Người tạo', template: this.itemCreatedBy, width: 180 },
      { field: 'createdOn', headerText: 'ngày tạo', template: this.itemCreateOn, width: 150 },
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

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
    }
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
      }
    }];
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddRangesComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }

  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }
  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
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
}
