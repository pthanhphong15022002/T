import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, CodxGridviewComponent, DialogData, DialogRef, NotificationsService, ViewsComponent, FormModel } from 'codx-core';
import { AnyARecord } from 'dns';
import { Observable, Subject } from 'rxjs';
import { CodxTMService } from '../../../codx-tm.service';
import { StatusTaskGoal } from '../../../models/enum/enum';
import { ToDo } from '../../../models/task.model';
import { TM_TaskGroups } from '../../../models/TM_TaskGroups.model';

@Component({
  selector: 'lib-pop-add-taskgroup',
  templateUrl: './pop-add-taskgroup.component.html',
  styleUrls: ['./pop-add-taskgroup.component.css']
})
export class PopAddTaskgroupComponent implements OnInit {
  @Input() taskGroups = new TM_TaskGroups();

  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('view') viewBase: ViewsComponent;

  user: any;
  STATUS_TASK_GOAL = StatusTaskGoal;

  functionID: string;
  data: any;
  gridViewSetup: any;
  enableAddtodolist: boolean = false;
  listTodo: any;
  todoAddText: any;
  title = 'Tạo mới công việc';
  formName = "";
  gridViewName = "";
  entityName = "";
  readOnly = false;
  action = "";
  dialog: any;
  isAfterRender = false;
  isAddMode = true;
  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,) {

    // this.taskGroups = {
    //   ...this.taskGroups,
    //   ...dt?.data,
    // };
    this.data = dialog.dataService!.dataSelected;
    this.taskGroups = this.data;
    // this.action = dt.data[1];
    this.dialog = dialog;
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    //   this.initForm();
    this.cache.gridViewSetup('TaskGroups', 'grvTaskGroups').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    })

    if (this.taskGroups.checkList) {
      for (let item of this.taskGroups.checkList.split(";")) {
        if (this.listTodo == null)
          this.listTodo = []
        var todo = new ToDo;
        todo.status = true;
        todo.text = item;
        this.listTodo.push(Object.assign({}, todo));
      }
    }
    this.changDetec.detectChanges();
    // this.openForm(this.taskGroups, false);
  }

  // initForm() {
  //   this.getFormGroup(this.formName, this.gridViewName).then((item) => {
  //     this.isAfterRender = true;
  //     if (this.isAddMode == true) {
  //       this.getAutonumber("TMS032", "TM_TaskGroups", "TaskGroupID").subscribe(key => {

  //         this.taskGroups.taskGroupID = key;
  //         this.taskGroups.approvalControl = "0";
  //         this.taskGroups.projectControl = "0";
  //         this.taskGroups.attachmentControl = "0";
  //         this.taskGroups.checkListControl = "0";
  //         this.listTodo = [];
  //       })
  //     }
  //   })
  // }

  // getFormGroup(formName, gridView): Promise<FormGroup> {
  //   return new Promise<FormGroup>((resolve, reject) => {
  //     this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
  //       var model = {};
  //       if (gv) {
  //         const user = this.authStore.get();
  //         for (const key in gv) {
  //           var b = false;
  //           if (Object.prototype.hasOwnProperty.call(gv, key)) {
  //             const element = gv[key];
  //             element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
  //             model[element.fieldName] = [];

  //             if (element.fieldName == "owner") {
  //               model[element.fieldName].push(user.userID);
  //             }
  //             if (element.fieldName == "createdOn") {
  //               model[element.fieldName].push(new Date());
  //             }
  //             else if (element.fieldName == "stop") {
  //               model[element.fieldName].push(false);
  //             }
  //             else if (element.fieldName == "orgUnitID") {
  //               model[element.fieldName].push(user['buid']);
  //             }
  //             else if (element.dataType == "Decimal" || element.dataType == "Int") {
  //               model[element.fieldName].push(0);
  //             }
  //             else if (element.dataType == "Bool" || element.dataType == "Boolean")
  //               model[element.fieldName].push(false);
  //             else if (element.fieldName == "createdBy") {
  //               model[element.fieldName].push(user.userID);
  //             } else {
  //               model[element.fieldName].push(null);
  //             }
  //           }
  //         }
  //       }
  //       resolve(this.fb.group(model, { updateOn: 'blur' }));
  //     });
  //   });
  // }

  // getAutonumber(functionID, entityName, fieldName): Observable<any> {
  //   var subject = new Subject<any>();
  //   this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
  //     "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
  //     .subscribe(item => {
  //       if (item)
  //         subject.next(item);
  //       else
  //         subject.next(null);
  //     });
  //   return subject.asObservable();
  // }

  onDeleteTodo(index) {
    this.listTodo.splice(index, 1);//remove element from array
    this.changDetec.detectChanges();
  }

  onAddToDo() {
    if (this.listTodo == null)
      this.listTodo = [];
    var todo = new ToDo;
    todo.status = false;
    todo.text = this.todoAddText;
    this.listTodo.push(Object.assign({}, todo));
    //this.listTodo.push(this.todoAddText);
    this.enableAddtodolist = !this.enableAddtodolist;
    this.todoAddText = "";
    this.changDetec.detectChanges();
  }

  addTodolist() {
    if (this.enableAddtodolist) {
      this.enableAddtodolist = false;
    }
    else {
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
  valueApp(data) {

    this.taskGroups.approvalControl = data.data;

    console.log(this.taskGroups.approvalControl);
  }
  valuePro(data) {
    this.taskGroups.projectControl = data.data;
  }
  valueAtt(data) {
    this.taskGroups.attachmentControl = data.data;

  }
  valueCheck(data) {
    this.taskGroups.checkListControl = data.data
  }
  closePanel() {
    this.dialog.close()
    //this.viewBase.currentView.closeSidebarRight();
  }

  openForm(data, isAddMode) {
    if (isAddMode == false) {
      this.isAddMode = false;
      this.taskGroups = new TM_TaskGroups();
      this.title = 'Chỉnh sửa nhóm công việc';
      this.api.execSv<any>('TM', 'TM', 'TaskGroupBusiness', 'GetTaskGroupByIdAsync', data.taskGroupID).subscribe((res) => {
        if (res) {
          data = res;
          this.taskGroups = data;
          if (data.checkList) {
            for (let item of data.checkList.split(";")) {
              if (this.listTodo == null)
                this.listTodo = []
              var todo = new ToDo;
              todo.status = true;
              todo.text = item;
              this.listTodo.push(Object.assign({}, todo));
            }
          }
          this.changDetec.detectChanges();

        }
      })
    }
    // this.renderer.addClass(popup, 'drawer-on');
  }

  //save


  beforeSave(op: any) {
    var data = [];
    if (this.isAddMode) {
      op.method = 'AddTaskGroupsAsync';
      data = [
        this.taskGroups,
        this.isAddMode
      ];
    } else {
      op.method = 'UpdateTaskGroupsAsync';
      data = [
        this.taskGroups,
        this.isAddMode
      ];
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
          this.lstSavecheckList.push(item.text)
        }
      }

      this.taskGroups.checkList = this.lstSavecheckList.join(";");
      if (this.taskGroups.checkList == "")
        this.taskGroups.checkList = null;
    }
    else {
      this.taskGroups.checkList = null;
    }
    if (this.isAddMode) {
      return this.addRow();
    }
    return this.updateRow();
  }

}
