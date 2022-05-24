import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToDo } from '@modules/tm/models/task.model';
import { TM_TaskGroups } from '@modules/tm/models/TM_TaskGroups.model';
import { APICONSTANT } from '@shared/constant/api-const';
import { ViewsComponent, ApiHttpService, UserModel, CodxListviewComponent } from 'codx-core';

@Component({
  selector: 'app-func-task-group',
  templateUrl: './func-task-group.component.html',
  styleUrls: ['./func-task-group.component.scss']
})
export class FuncTaskGroupComponent implements OnInit {
  listTodo: any;
  @Input('viewBase') viewBase: ViewsComponent;
  @Input() taskGroup = new TM_TaskGroups();

  @ViewChild('listView') listView: CodxListviewComponent;

  addEditForm: FormGroup;
  enableAddtodolist: boolean = false;
  todoAddText: any;
  isAddMode: true;
  isAfterRender
  user: UserModel;
  param: any;
  title = 'Tạo mới nhóm công việc';

  constructor( private dt: ChangeDetectorRef, private api: ApiHttpService) { }

  ngOnInit(): void {
  }
  getParam(callback = null) {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.SYS,
        APICONSTANT.ASSEMBLY.CM,
        APICONSTANT.BUSINESS.CM.Parameters,
        'GetDictionaryByPredicatedAsync',
        'TM_Parameters'
      )
      .subscribe((res) => {
        if (res) {
          this.param = res;
          return callback && callback(true);
        }
      });
  }

  openTask(): void {
    const t = this;
    this.taskGroup = new TM_TaskGroups();
    this.listTodo = [];
    this.taskGroup.ApprovalControl = '0';
    this.taskGroup.ProjectControl = '0';
    this.taskGroup.AttachmentControl = '0';
    this.taskGroup.CheckListControl = '0';
  
    if (!this.param)
      this.getParam(function (o) {
        //if (o) t.showPanel();
      });
    else {
      t.closePanel();
    }
  }

  openForm(dataItem, isAddMode){
    
  }
  
  closeNhomcongviec(){
    this.listTodo = [];
    this.closePanel();
    $('#canvas_nhomcongviec').removeClass('offcanvas-on');
  }
  closePanel() {
    this.viewBase.currentView.closeSidebarRight();
  }

  valueChange(e) {
    if (e.data.value) {
      this.addEditForm.value[e.field] = e.data.value;
    }
    else {
      this.addEditForm.value[e.field] = e.data
    }

    console.log(this.addEditForm.value);
  }

  addTodolist(){
    if (this.enableAddtodolist) {
      this.enableAddtodolist = false;
    }
    else {
      this.enableAddtodolist = true;
    }
  }

  onChangeToDoStatus(value, index){
    this.listTodo[index].status = value;
  }

  onDeleteTodo(index) {
    this.listTodo.splice(index, 1);//remove element from array
    this.dt.detectChanges();
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
    this.dt.detectChanges();
  }

  lstSavecheckList: any = [];
  OnSaveForm(){
    if (this.addEditForm.invalid == true) {
      
    }
    this.addEditForm.value.isGroup = true;
    this.lstSavecheckList = [];
    if (this.addEditForm.value.checkListControl == '2') {
      for (let item of this.listTodo) {
        if (item.status == true) {
          this.lstSavecheckList.push(item.text)
        }
      }

      this.addEditForm.value.checkList = this.lstSavecheckList.join(";");
      debugger
      if (this.addEditForm.value.checkList == "")
        this.addEditForm.value.checkList = null;
    }
    else {
      this.addEditForm.value.checkList = null;
    }

    return this.api
      .execSv("TM", "TM", "TaskGroupBusiness", "AddEditTaskGroupsAsync", [
        this.addEditForm.value, this.isAddMode
      ])
      .subscribe((res) => {
        if (res) {
          let item = this.addEditForm.value;
          item.createName = this.user.userName;
          item.createdBy = this.user.userID;
          this.listView.addHandler(item, this.isAddMode, "taskGroupID");
          this.closeNhomcongviec();
        }
      });
  }
}
