import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, DialogRef, SidebarModel, ViewModel, ViewType, CallFuncService, UIComponent } from 'codx-core';
import { PopAddProjectComponent } from './pop-add-project/pop-add-project.component';

@Component({
  selector: 'lib-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent extends UIComponent {
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemManager', { static: true }) itemManager: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStartdate', { static: true }) itemStartdate: TemplateRef<any>;
  @ViewChild('itemEnddate', { static: true }) itemEnddate: TemplateRef<any>;
  @ViewChild('itemProjectCategoryVll', { static: true }) itemProjectCategoryVll: TemplateRef<any>;
  @ViewChild('itemStatusVll', { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild('moreFunction', { static: true }) moreFunction: TemplateRef<any>;
  views: Array<ViewModel> = [];
  dialog!: DialogRef;

  // BaoLV 2.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;


  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, private callfunc: CallFuncService) {
    super(inject);
  }
  itemSelected: any;
  columnsGrid = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  //#region  init
  onInit(): void {
    this.columnsGrid = [
      { field: 'projectID', headerText: 'Mã dự án', width: 100 },
      { field: 'projectName', headerText: 'Tên dự án', width: 200 },
      { field: 'projectName2', headerText: 'Tên khác', width: 200 },
      { field: 'projectCategory', headerText: 'Phân loại', width: 140 },
      { field: 'status', headerText: 'Tình trạng', width: 140 },
      { field: 'projectManeger', headerText: 'Quản lí dự án', width: 200 },
      { field: 'projectGroupName', headerText: 'Nhóm dự án', width: 140 },
      { field: 'customerName', headerText: 'Khách hàng', width: 140 },
      { field: 'location', headerText: 'Địa điểm', width: 250 },
      { field: 'memo', headerText: 'Ghi chú', width: 140 },
      { field: 'startDate', headerText: 'Ngày bắt đầu', width: 150 },
      { field: 'endDate', headerText: 'Ngày kết thúc', width: 150 },
      { field: 'createName', headerText: 'Người tạo', width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', width: 100 }

      // BaoLV 1.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
      , { field: '', headerText: '#', width: 30 }
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
        template2: this.grid,
      }
    }];

    this.view.dataService.methodDelete = '';
  }
  //#endregion

  //#region CRUD method
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddProjectComponent, null, option);
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
  update(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddProjectComponent, null, option);
    });
  }

  // BaoLV 2.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected]).subscribe();
  };

  //#endregion

  //#region Func
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  // BaoLV 2.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'edit':
        this.update(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  //#endregion

  //#region event method
  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }
  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }

  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.dt.detectChanges();
  }
  // BaoLV 2.TM - Danh mục dự án - Chức năng cập nhật thông tin dự án
  beforeDel(opt: any) {
    var itemSelected = opt.data[0][0];
    opt.service = 'TM';
    opt.assemblyName = 'ERM.Business.TM';
    opt.className = 'ProjectsBusiness';
    opt.method = 'DeleteProjectAsync';
    opt.data = itemSelected.projectID;
    return true;
  }

}
