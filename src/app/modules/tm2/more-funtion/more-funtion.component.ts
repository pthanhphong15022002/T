import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { ActionTypeOnTask, StatusTask } from '../models/enum/enum';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';

@Component({
  selector: 'more-funtion',
  templateUrl: './more-funtion.component.html',
  styleUrls: ['./more-funtion.component.scss']
})
export class MoreFuntionComponent implements OnInit {
  @Input() data: any;
  //@Input() hideItem: Array<ActionType> = [];
  @Output() clickAction = new EventEmitter();
  readonly STATUS_TASK = StatusTask;
  readonly ACTION = ActionTypeOnTask;
  //readonly ACTION_TYPE = ActionType;

  constructor(private tmSv: TmService,
    // private baseService: BaseService,
    ) { }

  ChangeStatusTask(actionType) {
    this.onClickAction(this.data, this.ACTION.ChangeStatus, actionType);
  }
  onClickAction(data, actionType, value) {
    this.clickAction.emit({ data, actionType, value });
  }
  ngOnInit(): void {
  }
  viewDetailTask(taskID) {
    this.tmSv.showPanel.next(new InfoOpenForm(taskID, "TM003", VIEW_ACTIVE.Schedule, 'edit'));
  }
}
