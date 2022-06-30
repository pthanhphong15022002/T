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

  @ViewChild('view') view!: ViewsComponent;
  dialog!: DialogRef;

  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  views: Array<ViewModel> = [];
  itemSelected: any;
  constructor(private dt: ChangeDetectorRef,
    private callfunc: CallFuncService, private notiService: NotificationsService,
  ) { }

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'rangeID', headerText: 'Mã', width: 200 },
      { field: 'rangeName', headerText: 'Mô tả', width: 250 },
      { field: 'note', headerText: 'Ghi chú', width: 200 },
      { field: 'rangeID', headerText: 'Khoảng thời gian', width: 200 },
      { field: 'createdBy', headerText: 'Người tạo', width: 180 },
      { field: 'createdOn', headerText: 'ngày tạo', width: 150 },
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

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
    }
  }
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
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
        template: this.grid,
      }
    }];
    // this.view.dataService.methodSave = 'AddRangeKanbanAsync';
    this.view.dataService.methodDelete = 'DeleteRangesKanbanAsync';

  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '750px'; // s k thấy gửi từ ben đây,

      this.dialog = this.callfunc.openSide(PopAddRangesComponent, [this.view.dataService.dataSelected, 'add'], option);

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
      option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopAddRangesComponent, [this.view.dataService.dataSelected, 'edit'], option);
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
}
