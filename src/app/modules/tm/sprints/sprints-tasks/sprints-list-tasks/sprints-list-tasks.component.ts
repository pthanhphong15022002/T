import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmService } from '@modules/tm/tm.service';
import { DataRequest } from '@shared/models/data.request';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxListviewComponent,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
import * as moment from 'moment';

@Component({
  selector: 'app-sprints-list-tasks',
  templateUrl: './sprints-list-tasks.component.html',
  styleUrls: ['./sprints-list-tasks.component.scss']
})
export class SprintsListTasksComponent implements OnInit {

  @Input() data = [];
  @Input('viewBase') viewBase: ViewBaseComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  @Input() funcID: string;
  model = new DataRequest();
  user: any;
  i = 0;

  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  gridView: any;
  itemSelected: any;
  objectAssign: any;
  objectState: any;
  resourceViewList: any;
  columnGroupby = "createdOn";
  listNode = [];
  dataObj = { view: "listTasks", viewBoardID: "" };
  countOwner = 0;
  popoverList: any;
  popoverDetail: any;
  imployeeInfo: any = {};
  view: string;
  listEmpInfo = [];
  lstTaskbyParent = [];
  taskAction: any;
  iterationID : string = "";
  constructor(private tmSv: TmService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.authStore.get();
    this.user = this.authStore.get();
    this.activedRouter.firstChild?.params.subscribe(data=>this.iterationID=data.id);
    this.funcID =this.activedRouter.snapshot.params["funcID"];
    var dataObj = { view: '',calendarID:'', viewBoardID: this.iterationID };
    this.model.dataObj = JSON.stringify(dataObj);
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  trackByFn(index: number, item): string {
    return item.taskID;
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
    let field = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
  
    this.fromDate = moment('4/15/2022').toDate();
    this.toDate = moment('12/30/2022').toDate();
    model.page = 1;
    model.pageSize = 100;
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: field, value: this.fromDate },
        { operator: 'lte', field: field, value: this.toDate },
      ],
    };
    this.model = model ;
    const t = this;
    // t.tmSv.loadTaskByAuthen(model).subscribe((res) => {
    //   if (res && res.length) {
    //     this.data = res[0];
    //     this.itemSelected = res[0][0];
    //   }
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
      this.api.callSv("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", this.itemSelected?.id
      ).subscribe(res => {
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
  
  changeRowSelected(event) {
    this.itemSelected = event;
    this.data = this.listview?.data; 
  }
}
