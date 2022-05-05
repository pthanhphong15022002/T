import { ChangeDetectorRef, Component, Input, OnInit, Injector } from '@angular/core';
import { ApiHttpService, AuthStore } from 'codx-core';
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

  user: any;
  i = 0;

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

  dataObj = { view: "listTasks", viewBoardID: "" };

  popoverList: any;
  popoverDetail: any;
  imployeeInfo: any = {};
  listEmpInfo = [];
  lstTaskbyParent = [];

  constructor(private tmSv: TmService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    injector: Injector,
    //  private confirmationDialogService: ConfirmationDialogService,

  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // this.tmSv.isChangeData.subscribe(res => {
    //   if (res) {
    //     this.data = res.data.filter(x => x.userID == this.user.userID);
    //     if (this.data.length) {
    //       this.loadData();
    //     }
    //   }
    //   this.dt.detectChanges();
    // });
  }

  // groupByData(resource) {
  //   let handle = resource.map((item: any) => {
  //     return {
  //       owner: item.owner,
  //       userName: item.userName,
  //       startDate: item.startDate,
  //       endDate: item.endDate,
  //       dueDate: item.dueDate,
  //       taskID: item.taskID,
  //       id: item.taskID,
  //       taskName: item.taskName,
  //       memo: item.memo,
  //       memo2: item.memo2,
  //       backgroundColor: item.backgroundColor,
  //       createdOnDate: item.createdOn,
  //       status: item.status,
  //       priority: item.priority,
  //       write: item.write,
  //       delete: item.delete,
  //       comments: item.comments,
  //       attachments: item.attachments,
  //       todo: item.todo,
  //       assignTo: item.assignTo,
  //       category: item.category,
  //       groupBy: this.handleTime(item[this.columnGroupby])
  //     }
  //   });
  //   let dataGroup = _.groupBy(handle, 'groupBy');
  //   dataGroup = _.orderBy(dataGroup, ['groupBy'], ['asc']);
  //   this.resourceViewList = Object.entries(dataGroup);
  // }

  // handleTime(dateInput) {
  //   let date = moment(dateInput);
  //   //0;Hôm nay;1;Hôm qua;2;Tuần trước;3;Tháng trước;4;Cũ hơn
  //   if (date.isBetween(this.startOfToDay, this.endOfToDay)) {
  //     return '0';
  //   }
  //   if (date.isBetween(this.startOfYesterday, this.endOfYesterday)) {
  //     return '1';
  //   }
  //   if (date.isBetween(this.startOfLastWeek, this.endOfLastWeek)) {
  //     return '2';
  //   }
  //   if (date.isBetween(this.startOfMonth, this.endOfMonth)) {
  //     return '3';
  //   }
  //   return '4';
  // }

  trackByFn(index: number, item): string {
    return item.taskID;
  }

  onChangeStatusTask(data) {
    if (data.actionType == ActionTypeOnTask.ChangeStatus) {
      this.tmSv.onChangeStatusTask(data.data.taskID, data.value)
    }
  }

  dropDetail(memo, memo2) {

    memo = memo ? memo : '';
    memo2 = memo2 ? memo2 : '';
    let html = '<div class="d-flex flex-column flex-grow-1">' +
      '<div class="result-title text-dark font-size-h5 mb-2">Mô tả chi tiết</div>' +
      '<div class="text-dark-75 font-size-md">' +
      memo +
      '<div class="d-flex align-items-center mt-2">' +
      '<div class="d-flex align-items-center mr-2">' +
      '<span class="icon-create icon-18 text-dark-50"></span>' +
      '<span class="text-dark-50 text-italic">' + memo2
      +
      '</span></div></div></div>';
    return html;
  }

  loadData() {
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = '';
    model.funcID = "TM003"//this.viewBase.funcID ;
    model.page = 1;
    model.pageSize = 100;
    // model.dataValue = this.user.userID;
    // set max dinh
    this.fromDate = moment("3/31/2022").toDate();
    this.toDate = moment("4/30/2022").toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.toDate },
      ],
    };
    // let dataObj = { view: this.view, viewBoardID: '' };

    model.dataObj = "{\"view\":\"2\"}" //JSON.stringify(this.dataObj);
    const t = this;
    t.tmSv.loadTaskByAuthen(model).subscribe(
      (res) => {
        if (res && res.length) {
          this.data = res[0];
        } else {
          this.data = [];
        }

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
  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null)
        p.open();
    }
    else
      p.close();
  }

  PopoverEmp(p: any, emp) {
    this.popoverList = p;
    if (emp != null) {
      this.api.callSv("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [emp.taskID]).subscribe(res => {
        if (res && res.msgBodyData[0].length > 0) {
          this.lstTaskbyParent = res.msgBodyData[0];
          console.log("data123", this.lstTaskbyParent)
          p.open();
        }
      })
    }
    // else {
    //   this.lstTaskbyParent = [];
    //   p.close();
    // }
  }
  isTooltip(el) {
    return (el.offsetWidth < el.scrollWidth);
  }
}
