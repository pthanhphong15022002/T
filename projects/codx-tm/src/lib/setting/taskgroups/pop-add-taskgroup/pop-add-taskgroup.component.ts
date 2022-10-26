import {
  AfterViewInit,
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
  CallFuncService,
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
export class PopAddTaskgroupComponent implements OnInit, AfterViewInit {
  @Input() taskGroups = new TM_TaskGroups();

  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('addLink', { static: true }) addLink;

  user: any;
  STATUS_TASK_GOAL = StatusTaskGoal;
  param: any;
  functionID: string;
  data: any;
  gridViewSetup: any;
  enableAddtodolist: boolean = false;
  listTodo: any;
  todoAddText: any;
  title = '';
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
  listName = '';
  fieldValue = '';
  listCombobox = {};
  showInput = true;
  titleAction = '';
  verifyName = '';
  approveName = '';
  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.data = dialog.dataService!.dataSelected;
    this.taskGroups = this.data;
    this.dialog = dialog;
    this.action = dt.data[0];
    this.titleAction = dt.data[1];
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AutoNumberDefaultsBusiness',
        'GetFieldAutoNoAsync',
        [this.functionID, this.dialog.formModel.entityName]
      )
      .subscribe((res) => {
        if (res && res.stop) {
          this.showInput = false;
          if (this.action == 'add' || this.action == 'copy') {
            this.data.taskGroupID = '';
            this.taskGroups.taskGroupID = '';
          }
        } else {
          this.showInput = true;
        }
      });
  }
  ngAfterViewInit(): void {}

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
    if (this.action === 'edit') this.valueName();
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

  changeHours(e) {
    console.log(e);
    var numberValue = Number(e.data);
    if (numberValue > 0 && numberValue <= 8) {
      this.taskGroups.maxHours = numberValue;
    } else {
      this.notiService.notifyCode(
        'Vui lòng nhập giá trị lớn hơn 0 hoặc nhỏ hơn 9'
      );
      this.taskGroups.maxHours = 1;
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

  valueCbx(e, fieldValue) {
    console.log(e);
    var verifyByType = '';
    var verifyBy = '';
    var approveBy = '';
    var approves = '';
    if (fieldValue == 'verifyByType') {
      switch (e[0].objectType) {
        case 'U':
          verifyByType += e[0].objectType;
          verifyBy += e[0].id;
          this.api
            .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUser', verifyBy)
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.verifyName = res.userName;
              }
            });
          break;
        case 'R':
          verifyByType += e[0].objectType;
          verifyBy += e[0].id;
          this.api
            .execSv<any>('SYS', 'AD', 'RolesBusiness', 'GetOneAsync', verifyBy)
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.verifyName = res.roleName;
              }
            });
          break;
        case 'P':
          verifyByType += e[0].objectType;
          verifyBy += e[0].id;
          this.api
            .execSv<any>(
              'HR',
              'HR',
              'PositionsBusiness',
              'GetOneAsync',
              verifyBy
            )
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.verifyName = res.positionName;
              }
            });
          break;
        case 'TL':
          verifyByType += e[0].objectType;
          this.verifyName = verifyByType;
          break;
      }
      if (verifyByType) this.taskGroups.verifyByType = verifyByType;
      if (verifyBy) this.taskGroups.verifyBy = verifyBy;
    } else {
      switch (e[0].objectType) {
        case 'S':
          approveBy += e[0].objectType;
          this.approveName = approveBy;
          break;
        case 'R':
          approveBy += e[0].objectType;
          approves += e[0].id;
          this.api
            .execSv<any>('SYS', 'AD', 'RolesBusiness', 'GetOneAsync', approves)
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.approveName = res.roleName;
              }
            });
          break;
        case 'P':
          approveBy += e[0].objectType;
          approves += e[0].id;
          this.api
            .execSv<any>(
              'HR',
              'HR',
              'PositionsBusiness',
              'GetOneAsync',
              approves
            )
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.approveName = res.positionName;
              }
            });
          break;
        case 'TL':
          approveBy += e[0].objectType;
          this.approveName = approveBy;
          break;
        case 'U':
          approveBy += e[0].objectType;
          approves += e[0].id;
          this.api
            .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUser', approves)
            .subscribe((res) => {
              if (res) {
                console.log(res);
                this.approveName = res.userName;
              }
            });
          break;
      }
      if (approveBy) {
        this.taskGroups.approveBy = approveBy;
      }
      if (approves) this.taskGroups.approvers = approves;
    }
  }

  valueName() {
    //verify
    if (
      this.taskGroups.verifyByType !== 'R' &&
      this.taskGroups.verifyByType !== 'P' &&
      this.taskGroups.verifyByType !== 'U'
    ) {
      this.verifyName = this.taskGroups.verifyByType;
    } else {
      if (this.taskGroups.verifyByType === 'U') {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'UsersBusiness',
            'GetUser',
            this.taskGroups.verifyBy
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.verifyName = res.userName;
            }
          });
      } else if (this.taskGroups.verifyByType === 'P') {
        this.api
          .execSv<any>(
            'HR',
            'HR',
            'PositionsBusiness',
            'GetOneAsync',
            this.taskGroups.verifyBy
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.verifyName = res.positionName;
            }
          });
      } else {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'RolesBusiness',
            'GetOneAsync',
            this.taskGroups.verifyBy
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.verifyName = res.roleName;
            }
          });
      }
    }

    //approve
    if (
      this.taskGroups.approveBy !== 'R' &&
      this.taskGroups.approveBy !== 'P' &&
      this.taskGroups.approveBy !== 'U'
    ) {
      this.approveName = this.taskGroups.approveBy;
    } else {
      if (this.taskGroups.approveBy === 'U') {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'UsersBusiness',
            'GetUser',
            this.taskGroups.approvers
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.approveName = res.userName;
            }
          });
      } else if (this.taskGroups.approveBy === 'P') {
        this.api
          .execSv<any>(
            'HR',
            'HR',
            'PositionsBusiness',
            'GetOneAsync',
            this.taskGroups.approvers
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.approveName = res.positionName;
            }
          });
      } else {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'RolesBusiness',
            'GetOneAsync',
            this.taskGroups.approvers
          )
          .subscribe((res) => {
            if (res) {
              console.log(res);
              this.approveName = res.roleName;
            }
          });
      }
    }
  }

  closePanel() {
    this.dialog.close();
    //this.viewBase.currentView.closeSidebarRight();
  }

  openForm(data, isAddMode) {
    if (isAddMode == false) {
      this.isAddMode = false;
      this.taskGroups = new TM_TaskGroups();
      // this.title = 'Chỉnh sửa nhóm công việc';
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

  openShare(share: any, isOpen) {
    if (isOpen == true) {
      this.listCombobox = {
        U: 'Share_Users_Sgl',
        P: 'Share_Positions_Sgl',
        R: 'Share_UserRoles_Sgl',
      };
      this.listName = 'TM006';
      this.fieldValue = 'verifyByType';
      this.callfc.openForm(share, '', 420, window.innerHeight);
    } else {
      this.listCombobox = {
        U: 'Share_Users_Sgl',
        P: 'Share_Positions_Sgl',
        R: 'Share_UserRoles_Sgl',
      };
      this.listName = 'TM014';
      this.fieldValue = 'approveBy';
      this.callfc.openForm(share, '', 420, window.innerHeight);
    }
  }

  openShare1(share: any) {
    this.callfc.openForm(share, '', 420, window.innerHeight);
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
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    this.changDetec.detectChanges();
  }

  //save

  beforeSave(op: any) {
    var data = [];
    if (this.action === 'add') {
      op.method = 'AddTaskGroupsAsync';
      data = [this.taskGroups];
    } else if (this.action === 'edit') {
      op.method = 'UpdateTaskGroupsAsync';
      data = [this.taskGroups];
    }

    op.data = data;
    return true;
  }

  addRow() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.dialog.dataService.addDatas.clear();
        if (res.save) {
          this.dialog.close(res.save);
        }
      });
  }

  updateRow() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.dialog.dataService.addDatas.clear();
        if (res.update) {
          // this.dialog.dataService.setDataSelected(res.update[0]);
          this.dialog.close(res.update);
        }
      });
  }

  lstSavecheckList: any = [];

  onSave() {
    this.lstSavecheckList = [];
    if (this.taskGroups.checkListControl == '2') {
      for (let item of this.listTodo) {
        this.lstSavecheckList.push(item.text);
      }

      this.taskGroups.checkList = this.lstSavecheckList.join(';');
      if (this.taskGroups.checkList == '') this.taskGroups.checkList = null;
    } else {
      this.taskGroups.checkList = null;
    }

    if (this.action === 'add') {
      return this.addRow();
    }
    return this.updateRow();
  }

  openPopupLink() {
    var m = this.taskGroups.maxHours;
    this.callfc.openForm(this.addLink, '', 500, 300);
  }
}
