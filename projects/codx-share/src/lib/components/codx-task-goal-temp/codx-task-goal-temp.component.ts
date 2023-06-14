import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogModel } from 'codx-core';

@Component({
  selector: 'codx-task-goal-temp',
  templateUrl: './codx-task-goal-temp.component.html',
  styleUrls: ['./codx-task-goal-temp.component.css'],
})
export class CodxTaskGoalTempComponent {
  @ViewChild('popupToDoList') popupToDoList?: TemplateRef<any>;
  @Input() taskID: any;
  @Input() viewType = '1';
  @Input() countData = 0;
  @Input() zIndex = 0;
  @Input() headerText = 'Danh sách công việc cần làm'
  listTaskGoals = [];

  constructor(private api: ApiHttpService, private callfc: CallFuncService) {}
  onInit() {}

  openPopupTodoList() {
    this.api
      .execSv<any>(
        'TM',
        'TM',
        'TaskBusiness',
        'GetListTaskGoalByTaskIDAsync',
        this.taskID
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.listTaskGoals = res;
          let option = new DialogModel();
          option.zIndex = this.zIndex > 0 ? this.zIndex : 999;
          let popup = this.callfc.openForm(
            this.popupToDoList,
            '',
            400,
            500,
            '',
            null,
            '',
            option
          );
        }
      });
  }
}
