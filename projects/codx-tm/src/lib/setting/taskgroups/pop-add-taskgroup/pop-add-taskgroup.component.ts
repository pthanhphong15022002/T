import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxGridviewComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
  FormModel,
} from 'codx-core';
import { AnyARecord } from 'dns';
import { Observable, Subject } from 'rxjs';
import { CodxTMService } from '../../../codx-tm.service';
import { StatusTaskGoal } from '../../../models/enum/enum';
import { ToDo } from '../../../models/task.model';
import { TM_TaskGroups } from '../../../models/TM_TaskGroups.model';

@Component({
  selector: 'lib-pop-add-taskgroup',
  templateUrl: './pop-add-taskgroup.component.html',
  styleUrls: ['./pop-add-taskgroup.component.css'],
})
export class PopAddTaskgroupComponent implements OnInit {
  @Input() taskGroups = new TM_TaskGroups();

  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('view') viewBase: ViewsComponent;

  user: any;
  STATUS_TASK_GOAL = StatusTaskGoal;
  param: any;
  paramModule: any;
  functionID: string;
  data: any;
  gridViewSetup: any;
  enableAddtodolist: boolean = false;
  listTodo: any;
  todoAddText: any;
  title = 'Tạo mới công việc';
  formName = '';
  gridViewName = '';
  gridViewSetUp: any;
  checked: any;
  entityName = '';
  readOnly = false;
  action = '';
  dialog: any;
  isAfterRender = false;
  isAddMode = true;

  listCombobox = {
    U: 'Share_Users_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
  };

  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.getParam();
    // this.taskGroups = {
    //   ...this.taskGroups,
    //   ...dt?.data,
    // };
    this.data = dialog.dataService!.dataSelected;
    this.taskGroups = this.data;
    this.action = dt.data[1];
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    //   this.initForm();
    this.cache.gridViewSetup('TaskGroups', 'grvTaskGroups').subscribe((res) => {
      if (res) this.gridViewSetup = res;
    });

    if (this.taskGroups.checkList) {
      for (let item of this.taskGroups.checkList.split(';')) {
        if (this.listTodo == null) this.listTodo = [];
        var todo = new ToDo();
        todo.status = true;
        todo.text = item;
        this.listTodo.push(Object.assign({}, todo));
      }
    }
    this.changDetec.detectChanges();
    // this.openForm(this.taskGroups, false);
    this.getGridViewSetUp();
  }

  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetParameterByModuleWithCategoryAsync',
        ['TM_Parameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          this.paramModule = this.param;
        }
      });
  }

  onDeleteTodo(index) {
    this.listTodo.splice(index, 1); //remove element from array
    this.changDetec.detectChanges();
  }

  onAddToDo() {
    if (this.listTodo == null) this.listTodo = [];
    var todo = new ToDo();
    todo.status = false;
    todo.text = this.todoAddText;
    this.listTodo.push(Object.assign({}, todo));
    //this.listTodo.push(this.todoAddText);
    this.enableAddtodolist = !this.enableAddtodolist;
    this.todoAddText = '';
    this.changDetec.detectChanges();
  }

  getGridViewSetUp() {
    this.cache.functionList(this.functionID).subscribe((func) => {
      console.log('functuonID: ', func);
      this.cache
        .gridViewSetup(func?.formName, func?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetUp = grd;
          console.log('gridViewSetUp: ', this.gridViewSetUp);
        });
    });
  }

  addTodolist() {
    if (this.enableAddtodolist) {
      this.enableAddtodolist = false;
    } else {
      this.enableAddtodolist = true;
    }
  }

  onChangeToDoStatus(value, index) {
    this.listTodo[index].status = value;
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.taskGroups.note = dt?.value ? dt.value : dt;
  }

  valueChange(data) {
    if (data.data) {
      this.taskGroups.taskGroupName = data.data;
    }
  }
  valueList(data) {
    this.taskGroups[data.field] = data.data;
  }

  valueWitch(data) {
    if (data.data == true) {
      this.taskGroups[data.field] = '1';

    } else {
      this.taskGroups[data.field] = '0';
    }

  }
  // valuePro(data) {
  //   this.taskGroups.projectControl = data.data;
  // }
  // valueAtt(data) {
  //   this.taskGroups.attachmentControl = data.data;

  // }
  valueCheck(data) {
    this.taskGroups.checkListControl = data.data;
  }
  closePanel() {
    this.dialog.close();
    //this.viewBase.currentView.closeSidebarRight();
  }

  openForm(data, isAddMode) {
    if (isAddMode == false) {
      this.isAddMode = false;
      this.taskGroups = new TM_TaskGroups();
      this.title = 'Chỉnh sửa nhóm công việc';
      this.api
        .execSv<any>(
          'TM',
          'TM',
          'TaskGroupBusiness',
          'GetTaskGroupByIdAsync',
          data.taskGroupID
        )
        .subscribe((res) => {
          if (res) {
            data = res;
            this.taskGroups = data;
            if (data.checkList) {
              for (let item of data.checkList.split(';')) {
                if (this.listTodo == null) this.listTodo = [];
                var todo = new ToDo();
                todo.status = true;
                todo.text = item;
                this.listTodo.push(Object.assign({}, todo));
              }
            }
            this.changDetec.detectChanges();
          }
        });
    }
    // this.renderer.addClass(popup, 'drawer-on');
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-playlist_add_check',
      text: 'Kiểm soát nhập liệu',
      name: 'Control',
    },
    { icon: 'icon-playlist_add_check', text: 'Việc cần làm', name: 'Job' },
  ];

  setTitle(e: any) {
    if (this.action == 'add') {
      this.title = 'Thêm ' + e;
    } else if (this.action == 'edit') {
      this.title = 'Sửa ' + e;
    }
    this.changDetec.detectChanges();
  }

  //save

  beforeSave(op: any) {
    var data = [];
    if (this.isAddMode) {
      op.method = 'AddTaskGroupsAsync';
      data = [this.taskGroups, this.isAddMode];
    } else {
      op.method = 'UpdateTaskGroupsAsync';
      data = [this.taskGroups, this.isAddMode];
    }

    op.data = data;
    return true;
  }

  addRow() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.dataService.setDataSelected(res.save);
          this.dialog.dataService.afterSave.next(res);
          this.changDetec.detectChanges();
        }
      });
    this.closePanel();
  }

  updateRow() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.dataService.setDataSelected(res.update[0]);
          this.dialog.close();
        }
      });
  }

  lstSavecheckList: any = [];

  onSave() {
    this.lstSavecheckList = [];
    if (this.taskGroups.checkListControl == '2') {
      for (let item of this.listTodo) {
        if (item.status == true) {
          this.lstSavecheckList.push(item.text);
        }
      }

      this.taskGroups.checkList = this.lstSavecheckList.join(';');
      if (this.taskGroups.checkList == '') this.taskGroups.checkList = null;
    } else {
      this.taskGroups.checkList = null;
    }

    if (this.isAddMode) {
      return this.addRow();
    }
    return this.updateRow();
  }

  valueCbx(e) {
    console.log(e);
    var lstUserType = '';
    var lstPositionType = '';
    var lstUserRoleType = '';
    var verifyByType = '';
    e.data?.forEach((e) => {
      switch (e.objectType) {
        case 'U':
          if (!lstUserType.includes(e.objectType)) {
            lstUserType += e.objectType + ';';
          }
          break;
        case 'R':
          if (!lstPositionType.includes(e.objectType)) {
            lstPositionType += e.objectType + ';';
          }
          break;
        case 'P':
          if (!lstUserRoleType.includes(e.objectType)) {
            lstUserRoleType += e.objectType + ';';
          }
          break;
      }
    });
    if (e.data != null) {
      verifyByType = lstUserType + lstPositionType + lstUserRoleType;
    }
    if (verifyByType) {
      verifyByType = verifyByType.substring(0, verifyByType.length - 1);
    }

    this.taskGroups.verifyByType = verifyByType;
  }
}
