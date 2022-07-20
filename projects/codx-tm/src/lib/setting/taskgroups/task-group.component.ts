import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthStore, ButtonModel, CacheService, CallFuncService, DialogRef, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopAddTaskgroupComponent } from './pop-add-taskgroup/pop-add-taskgroup.component';

@Component({
  selector: 'lib-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.css']
})
export class TaskGroupComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('itemTaskGroupID', { static: true }) itemTaskGroupID: TemplateRef<any>;
  @ViewChild('itemTaskGroupName', { static: true }) itemTaskGroupName: TemplateRef<any>;
  @ViewChild('itemTaskGroupName2', { static: true }) itemTaskGroupName2: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemApprovalControl', { static: true }) itemApprovalControl: TemplateRef<any>;
  @ViewChild('itemProjectControl', { static: true }) itemProjectControl: TemplateRef<any>;
  @ViewChild('itemAttachmentControl', { static: true }) itemAttachmentControl: TemplateRef<any>;
  @ViewChild('itemCheckListControl', { static: true }) itemCheckListControl: TemplateRef<any>;
  @ViewChild('itemCheckList', { static: true }) itemCheckList: TemplateRef<any>;
  @ViewChild('itemNote', { static: true }) itemNote: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;

  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;

  @ViewChild('view') view!: ViewsComponent;

  constructor(private dt: ChangeDetectorRef, private callfunc: CallFuncService,
  ) {

  }

  views: Array<ViewModel> = [];
  formName = "";
  gridViewName = "";
  columnsGrid = [];
  dialog!: DialogRef;
  itemSelected: any;
  popoverList: any;
  popoverDetail: any;
  isAfterRender = false;
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none'
  }
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4
  }

  ngOnInit(): void {
    this.columnsGrid = [
      { headerTemplate: this.itemTaskGroupID, width: 150 },
      { headerTemplate: this.itemTaskGroupName, width: 200 },
      { headerTemplate: this.itemTaskGroupName2, width: 200 },
      { headerTemplate: this.itemNote, width: 200 },
      { headerTemplate: this.itemApprovalControl, width: 140 },
      { headerTemplate: this.itemProjectControl, width: 140 },
      { headerTemplate: this.itemAttachmentControl, width: 140 },
      { headerTemplate: this.itemCheckListControl, width: 180 },
      { headerTemplate: this.itemCheckList, width: 200 },
      { headerTemplate: this.itemCreatedBy, width: 200 },
      { headerTemplate: this.itemCreatedOn, width: 100 },
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

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: false,
      model: {
        resources: this.columnsGrid,
        template: this.grid,
      }
    },
    {
      type: ViewType.list,
      sameData: true,
      active: true,
      model: {
        template: this.itemTemplate,
      }
    }];
    this.view.dataService.methodSave = 'AddTaskGroupsAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskGroupsAsync'
    this.view.dataService.methodDelete = 'DeleteTaskGroupAsync';

  }

  //#region Functions
  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
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

  getCheckList(checkList) {
    if (checkList != null) {
      return checkList.split(";");
    }
    return []

  }

  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp.checkList.split(";");
      if (emp.checkList != null)
        p.open();
    }
    else
      p.close();
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, null, option);

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
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, 'edit', option);
    });
  }

  delete(data: any) {
    // this.view.dataService.dataSelected = data;
    // this.view.dataService.delete([this.view.dataService.dataSelected] , true ,(opt,) =>
    //   this.beforeDel(opt)).subscribe((res) => {
    //     if (res[0]) {
    //       this.itemSelected = this.view.dataService.data[0];
    //     }
    //   }
    //   );
  };


  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteTaskGroupAsync';

    opt.data = itemSelected.taskGroupID;
    return true;
  }

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  aaa(val: any) {
    console.log(val);
  }

}
