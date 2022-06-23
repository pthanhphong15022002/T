import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType, CallFuncService } from 'codx-core';
import { PopAddProjectComponent } from './pop-add-project/pop-add-project.component';

@Component({
  selector: 'lib-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemManager', { static: true }) itemManager: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStartdate', { static: true }) itemStartdate: TemplateRef<any>;
  @ViewChild('itemEnddate', { static: true }) itemEnddate: TemplateRef<any>;
  @ViewChild('itemProjectCategoryVll', { static: true }) itemProjectCategoryVll: TemplateRef<any>;
  @ViewChild('itemStatusVll', { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  views: Array<ViewModel> = [];
  dialog!: DialogRef;


  constructor(private dt: ChangeDetectorRef, private callfunc: CallFuncService) { }
  itemSelected: any;
  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'projectID', headerText: 'Mã dự án', width: 100 },
      { field: 'projectName', headerText: 'Tên dự án', width: 200 },
      { field: 'projectName2', headerText: 'Tên khác', width: 200 },
      { field: 'projectCategory', headerText: 'Phân loại', template: this.itemProjectCategoryVll, width: 140 },
      { field: 'status', headerText: 'Tình trạng', template: this.itemStatusVll, width: 140 },
      { field: 'projectManeger', headerText: 'Quản lí dự án', template: this.itemManager, width: 200 },
      { field: 'projectGroupName', headerText: 'Nhóm dự án', width: 140 },
      { field: 'customerName', headerText: 'Khách hàng', width: 140 },
      { field: 'location', headerText: 'Địa điểm', width: 250 },
      { field: 'memo', headerText: 'Ghi chú', width: 140 },
      { field: 'startDate', headerText: 'Ngày bắt đầu', template: this.itemStartdate, width: 150 },
      { field: 'finishDate', headerText: 'Ngày kết thúc', template: this.itemEnddate, width: 150 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
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
      this.dialog = this.callfunc.openSide(PopAddProjectComponent, this.view.dataService.dataSelected, option);
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
}
