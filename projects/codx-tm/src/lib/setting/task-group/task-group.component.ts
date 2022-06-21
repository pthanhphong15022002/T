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
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStopCheck', { static: true }) itemStopCheck: TemplateRef<any>;
  @ViewChild('itemApprovalControlVll', { static: true }) itemApprovalControlVll: TemplateRef<any>;
  @ViewChild('itemProjectControlVll', { static: true }) itemProjectControlVll: TemplateRef<any>;
  @ViewChild('itemAttachmentControl', { static: true }) itemAttachmentControl: TemplateRef<any>;
  @ViewChild('itemCheckListControlVll', { static: true }) itemCheckListControlVll: TemplateRef<any>;
  @ViewChild('itemCheckList', { static: true }) itemCheckList: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;

  constructor(private cache: CacheService, private auth: AuthStore, private fb: FormBuilder,
    private dt: ChangeDetectorRef,     private callfunc: CallFuncService,
    ) { }

  views: Array<ViewModel> = [];
  formName = "";
  gridViewName = "";
  columnsGrid = [];
  dialog!: DialogRef;

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
    this.initForm();
    this.columnsGrid = [
      { field: 'taskGroupID', headerText: 'Mã nhóm', width: 100 },
      { field: 'taskGroupName', headerText: 'Nhóm công việc', width: 200 },
      { field: 'taskGroupName2', headerText: 'Tên khác', width: 200 },
      { field: 'note', headerText: 'Ghi chú', width: 180 },
      { field: 'approvalControl', headerText: 'Xét duyệt?', template: this.itemApprovalControlVll, width: 140 },
      { field: 'projectControl', headerText: 'Chọn dự án', template: this.itemProjectControlVll, width: 140 },
      { field: 'attachmentControl', headerText: 'Đính kèm file', template: this.itemAttachmentControl, width: 140 },
      { field: 'checkListControl', headerText: 'Nhập việc cần làm', template: this.itemCheckListControlVll, width: 180 },
      { field: 'checkList', headerText: 'CheckList', template: this.itemCheckList, width: 100 },
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
        template: this.GiftIDCell,
        resources: this.columnsGrid,
      }
    }];
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      // this.addEditForm = item;
      this.isAfterRender = true;
      // this.getAutonumber("TM00632", "TM_TaskGroups", "TaskGroupID").subscribe(key => {
      
      //   this.taskGroups.taskGroupID = key;
      //   this.taskGroups.approvalControl = "0";
      //   this.taskGroups.projectControl = "0";
      //   this.taskGroups.attachmentControl = "0";
      //   this.taskGroups.checkListControl = "0";
      //   this.listTodo = [];
      // })
    })
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == "owner") {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == "createdOn") {
                model[element.fieldName].push(new Date());
              }
              else if (element.fieldName == "stop") {
                model[element.fieldName].push(false);
              }
              else if (element.fieldName == "orgUnitID") {
                model[element.fieldName].push(user['buid']);
              }
              else if (element.dataType == "Decimal" || element.dataType == "Int") {
                model[element.fieldName].push(0);
              }
              else if (element.dataType == "Bool" || element.dataType == "Boolean")
                model[element.fieldName].push(false);
              else if (element.fieldName == "createdBy") {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }

              // if (element.isRequire) {
              //   model[element.fieldName].push(Validators.compose([
              //     Validators.required,
              //   ]));
              // }
              // else {
              //   model[element.fieldName].push(Validators.compose([
              //   ]));
              // }
            }
          }
        }

        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });

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

  edit(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, this.view.dataService.dataSelected, option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], this.beforeDel)
      .subscribe();
  }

  beforeDel(opt: RequestOption) {
    opt.service = 'TM';
    opt.assemblyName = 'TM';
    opt.className = 'TaskBusiness';
    opt.methodName = 'TestApi';
    return true;
  }
}
