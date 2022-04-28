import { Component, Input, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import * as moment from 'moment';
import { ActionTypeOnTask } from '../models/enum/enum';
import { TmService } from '../tm.service';

declare var _;


@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  @Input() data: any = [];

  resourceViewList: any;
  columnGroupby = "createdOn";
  startOfToDay = moment().startOf('day');
  endOfToDay = moment().endOf('day');
  startOfYesterday = moment().subtract(1, 'day').startOf('day')
  endOfYesterday = moment().subtract(1, 'day').endOf('day')
  startOfMonth = moment().startOf('month');
  endOfMonth = moment().endOf('month');
  startOfLastWeek = moment().startOf('week');
  endOfLastWeek = moment().endOf('week');
  constructor(private tmSv: TmService, private api: ApiHttpService) { }

  ngOnInit(): void {
    if (this.data) {
      this.loadData(this.data);
    }
  }

  groupByData(resource) {
    let handle = resource.map((item: any) => {
      return {
        owner: item.owner,
        userName: item.userName,
        startDate: item.startDate,
        endDate: item.endDate,
        dueDate: item.dueDate,
        taskID: item.taskID,
        id: item.taskID,
        taskName: item.taskName,
        memo: item.memo,
        memo2: item.memo2,
        backgroundColor: item.backgroundColor,
        createdOnDate: item.createdOn,
        status: item.status,
        priority: item.priority,
        write: item.write,
        delete: item.delete,
        comments: item.comments,
        attachments: item.attachments,
        todo: item.todo,
        assignTo: item.assignTo,
        category: item.category,
        groupBy: this.handleTime(item[this.columnGroupby])
      }
    });
    let dataGroup = _.groupBy(handle, 'groupBy');
    dataGroup = _.orderBy(dataGroup, ['groupBy'], ['asc']);
    this.resourceViewList = Object.entries(dataGroup);
  }

  handleTime(dateInput) {
    let date = moment(dateInput);
    //0;Hôm nay;1;Hôm qua;2;Tuần trước;3;Tháng trước;4;Cũ hơn
    if (date.isBetween(this.startOfToDay, this.endOfToDay)) {
      return '0';
    }
    if (date.isBetween(this.startOfYesterday, this.endOfYesterday)) {
      return '1';
    }
    if (date.isBetween(this.startOfLastWeek, this.endOfLastWeek)) {
      return '2';
    }
    if (date.isBetween(this.startOfMonth, this.endOfMonth)) {
      return '3';
    }
    return '4';
  }



  onChangeStatusTask(data) {
    if (data.actionType == ActionTypeOnTask.ChangeStatus) {
      this.tmSv.onChangeStatusTask(data.data.taskID, data.value)
    }
  }
  loadData(data){
    this.tmSv.loadTaskByAuthen(data).subscribe((res)=>{
            if(res && res.length){
              console.log(res);
              this.data = res[0];
            }
        //this.users = resp[0];
    })
}
}
