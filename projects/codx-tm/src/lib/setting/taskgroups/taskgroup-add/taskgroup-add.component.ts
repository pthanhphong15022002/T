import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogRef } from 'codx-core';
import { ToDo } from '../../../models/task.model';

@Component({
  selector: 'lib-taskgroup-add',
  templateUrl: './taskgroup-add.component.html',
  styleUrls: ['./taskgroup-add.component.css']
})
export class TaskgroupAddComponent implements OnInit {
  title = 'Tạo mới công việc';
  data: any;
  dialog: DialogRef;
  enableAddtodolist: boolean = false;
  listTodo: any;
  todoAddText: any;
  constructor(
    private changDetec: ChangeDetectorRef,

    @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.data = dialog.dataService!.dataSelected;
  }

  ngOnInit(): void {
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
}
