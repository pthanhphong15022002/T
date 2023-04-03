import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopAddTaskgroupComponent } from './pop-add-taskgroup/pop-add-taskgroup.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.css'],
})
export class TaskGroupComponent extends UIComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('itemTaskGroupID', { static: true })
  itemTaskGroupID: TemplateRef<any>;
  @ViewChild('itemTaskGroupName', { static: true })
  itemTaskGroupName: TemplateRef<any>;
  @ViewChild('itemTaskGroupName2', { static: true })
  itemTaskGroupName2: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemProjectControl', { static: true })
  itemProjectControl: TemplateRef<any>;
  @ViewChild('itemLocationControl', { static: true })
  itemLocationControl: TemplateRef<any>;
  @ViewChild('itemPlanControl', { static: true })
  itemPlanControl: TemplateRef<any>;
  @ViewChild('itemUpdateControl', { static: true })
  itemUpdateControl: TemplateRef<any>;
  @ViewChild('itemCheckListControl', { static: true })
  itemCheckListControl: TemplateRef<any>;
  @ViewChild('itemVerifyControl', { static: true })
  itemVerifyControl: TemplateRef<any>;
  @ViewChild('itemApproveControl', { static: true })
  itemApproveControl: TemplateRef<any>;
  @ViewChild('itemMaxHoursControl', { static: true })
  itemMaxHoursControl: TemplateRef<any>;
  @ViewChild('itemEditControl', { static: true })
  itemEditControl: TemplateRef<any>;
  @ViewChild('itemDueDateControl', { static: true })
  itemDueDateControl: TemplateRef<any>;
  @ViewChild('itemAutoCompleted', { static: true })
  itemAutoCompleted: TemplateRef<any>;
  @ViewChild('itemCompletedControl', { static: true })
  itemCompletedControl: TemplateRef<any>;
  @ViewChild('itemExtendControl', { static: true })
  itemExtendControl: TemplateRef<any>;
  @ViewChild('itemConfirmControl', { static: true })
  itemConfirmControl: TemplateRef<any>;

  @ViewChild('itemNote', { static: true }) itemNote: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;

  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;

  // @ViewChild('view') view!: ViewsComponent;

  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  user: any;
  funcID: any;
  views: Array<ViewModel> = [];
  formName = '';
  gridViewName = '';
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
    border: 'none',
  };
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4,
  };
  titleAction = '';

  onInit(): void {
    this.columnsGrid = [
      { headerTemplate: this.itemTaskGroupID, width: 150 },
      { headerTemplate: this.itemTaskGroupName, width: 200 },
      { headerTemplate: this.itemTaskGroupName2, width: 200 },
      { headerTemplate: this.itemNote, width: 200 },
      { headerTemplate: this.itemProjectControl, width: 140 },
      { headerTemplate: this.itemLocationControl, width: 140 },
      { headerTemplate: this.itemPlanControl, width: 180 },
      { headerTemplate: this.itemUpdateControl, width: 180 },
      { headerTemplate: this.itemCheckListControl, width: 180 },
      { headerTemplate: this.itemVerifyControl, width: 180 },
      { headerTemplate: this.itemApproveControl, width: 180 },
      { headerTemplate: this.itemMaxHoursControl, width: 140 },
      { headerTemplate: this.itemEditControl, width: 180 },
      { headerTemplate: this.itemDueDateControl, width: 180 },
      { headerTemplate: this.itemAutoCompleted, width: 180 },
      { headerTemplate: this.itemCompletedControl, width: 180 },
      { headerTemplate: this.itemExtendControl, width: 180 },
      { headerTemplate: this.itemConfirmControl, width: 180 },
      { headerTemplate: this.itemCreatedBy, width: 200 },
      { headerTemplate: this.itemCreatedOn, width: 100 },
      { field: '', headerText: '', width: 30 },
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
    this.titleAction = e?.text;
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
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
    this.view.dataService.methodSave = 'AddTaskGroupsAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskGroupsAsync';
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
    this.titleAction = evt?.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  moreFuncClick(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
  //#endregion

  getCheckList(checkList) {
    if (checkList != null) {
      return checkList.split(';');
    }
    return [];
  }

  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp.checkList.split(';');
      if (emp.checkList != null) p.open();
    } else p.close();
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopAddTaskgroupComponent,
        ['add', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event != null) {
          this.view.dataService.update(e.event).subscribe();
          this.detectorRef.detectChanges();
        }

      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        this.dialog = this.callfc.openSide(
          PopAddTaskgroupComponent,
          ['edit', this.titleAction],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e && e.event != null) {
            this.view.dataService.update(e.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfc.openSide(
        PopAddTaskgroupComponent,
        ['copy', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        // if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //   );
      });
    });
  }
  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
  }

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

  innerHTML(note) {
    var desc = document.createElement('div');
    if (note) {
      desc.innerHTML = '<div>' + note + '</div>';
    }
    return desc.innerText;
  }
}
