import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import * as moment from 'moment';
import { ActionTypeOnTask } from '../models/enum/enum';
import { TmService } from '../tm.service';
import { DataRequest } from '@shared/models/data.request';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';


declare var _;


@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  @Input() data: any = [];
  @Input('viewBase') viewBase: ViewBaseComponent;

  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  gridView: any;
  

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
  constructor(private tmSv: TmService, private api: ApiHttpService, private dt: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    // if (this.data) {
      this.loadData();
    // }
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
  loadData(){

    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = '';
    model.funcID = this.viewBase.funcID ;
    model.page = 1;
    model.pageSize = 100;
    // model.dataValue = this.user.userID;
   // set max dinh
    this.fromDate =moment("3/31/2022").toDate();
    this.toDate = moment("4/30/2022").toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value:  this.toDate },
      ],
    };
    // let dataObj = { view: this.view, viewBoardID: '' };

    model.dataObj =  "{\"view\":\"2\"}" //JSON.stringify(this.dataObj);
    const t = this;
    t.tmSv.loadTaskByAuthen(model).subscribe(
      (res) => {
      if (res && res.length) {
        this.data = res[1];
      }else{
        this.data=[] ;
      }
      this.groupByData(this.data)
      t.dt.detectChanges();
      });
    // this.tmSv.loadTaskByAuthen(data).subscribe((res)=>{
    //         if(res && res.length){
    //           console.log(res);
    //           this.data = res[0];
    //         }
    //     //this.users = resp[0];
    // })
}
}
