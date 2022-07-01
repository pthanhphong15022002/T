import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

  constructor(private cache: CacheService, private auth: AuthStore,
    private dt: ChangeDetectorRef, private callfunc: CallFuncService,
  ) { }

  views: Array<ViewModel> = [];
  formName = "";
  gridViewName = "";
  columnsGrid = [];
  dialog!: DialogRef;
  itemSelected: any;

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
      { headerTemplate: this.itemTaskGroupID , width: 150 },
      { headerTemplate: this.itemTaskGroupName , width: 200 },
      { headerTemplate: this.itemTaskGroupName2 , width: 200 },
      { headerTemplate: this.itemNote , width: 200 },
      { headerTemplate: this.itemApprovalControl , width: 140 },
      { headerTemplate: this.itemProjectControl , width: 140 },
      { headerTemplate: this.itemAttachmentControl , width: 140 },
      { headerTemplate: this.itemCheckListControl , width: 180 },
      { headerTemplate: this.itemCheckList , width: 200 },
      { headerTemplate: this.itemCreatedBy , width: 200 },
      { headerTemplate: this.itemCreatedOn , width: 100 },
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
        template: this.grid
      }
    }];
    this.view.dataService.methodSave = 'AddTaskGroupsAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskGroupsAsync';
    this.view.dataService.methodDelete = 'DeleteTaskGroupAsync';

  }



  getCheckList(checkList) {
    if (checkList != null) {
      return checkList.split(";");
    }
    return []

  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
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
      this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, [this.view.dataService.dataSelected, 'edit'], option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
              .delete([this.view.dataService.dataSelected], (opt) =>
                this.beforeDel(opt)
              )
              .subscribe((res) => {
              
              });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0][0];
    opt.methodName = 'DeleteTaskGroupAsync';
    
    opt.data = itemSelected.taskGroupID;
    return true;
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
