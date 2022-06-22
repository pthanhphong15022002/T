import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, CodxGridviewComponent, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { Observable, Subject } from 'rxjs';
import { CodxTMService } from '../../../codx-tm.service';
import { ToDo } from '../../../models/task.model';
import { TM_TaskGroups } from '../../../models/TM_TaskGroups.model';

@Component({
  selector: 'lib-pop-add-taskgroup',
  templateUrl: './pop-add-taskgroup.component.html',
  styleUrls: ['./pop-add-taskgroup.component.css']
})
export class PopAddTaskgroupComponent implements OnInit {
  @Input() taskGroups = new TM_TaskGroups();
  @Input() data: [];
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('view') viewBase: ViewsComponent;

  user: any;
  functionID: string;
  gridViewSetup: any;
  enableAddtodolist: boolean = false;
  listTodo: any;
  todoAddText: any;
  title = 'Tạo mới công việc';
  formName = "";
  gridViewName = "";
  readOnly = false;

  dialog: any;
  isAfterRender = false;
  isAddMode = true;
  constructor(
    private authStore: AuthStore,
    private cache: CacheService,
    private changDetec: ChangeDetectorRef,
    private fb: FormBuilder,
    private tmSv: CodxTMService,
    private api: ApiHttpService,
    private notiService: NotificationsService,

    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,) {
    this.taskGroups = {
      ...this.taskGroups,
      ...dt?.data,
    };
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.initForm();
    this.cache.gridViewSetup('TaskGroups', 'grvTaskGroups').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    })
  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      this.getAutonumber("TM00632", "TM_TaskGroups", "TaskGroupID").subscribe(key => {

        this.taskGroups.taskGroupID = key;
        this.taskGroups.approvalControl = "0";
        this.taskGroups.projectControl = "0";
        this.taskGroups.attachmentControl = "0";
        this.taskGroups.checkListControl = "0";
        this.listTodo = [];
      })
    })
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.authStore.get();
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
            }
          }
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

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
  //save
  addRow() {
    var t = this;
    this.tmSv.addTaskGroup(this.taskGroups)
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res[0].message);
       //   this.notiService.notify('Phải thêm người được giao việc !');

          t.data = res[1];
          this.gridView.addHandler(t.data, this.isAddMode, "taskGroupID");
        }
       
      })
      this.closePanel();
  }

  updateRow() {
    var t = this;
    this.tmSv.updateTaskGroup(this.taskGroups)
      .subscribe((res) => {
        if (res) {
          this.notiService.notify(res[0].message);
          t.data = res[1];
          this.gridView.addHandler(t.data, this.isAddMode, "taskGroupID");
        }
      })
      this.closePanel(); 
  }

  lstSavecheckList: any = [];

  OnSaveForm() {
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
