import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TM_Sprints } from '@modules/tm/models/TM_Sprints.model';
import { DataRequest } from '@shared/models/data.request';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxListviewComponent,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import * as moment from 'moment';
import { TmService } from '../../tm.service';


@Component({
  selector: 'app-view-details-sprints',
  templateUrl: './view-details-sprints.component.html',
  styleUrls: ['./view-details-sprints.component.scss']
})
export class ViewDetailsSprintsComponent implements OnInit {
  @Input() data = [];
  sprints : TM_Sprints ;
  view: string;
  user: any;
  objectAssign: any;
  objectState: any;
  itemSelected = null;
  moment = moment().locale('en');
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf('day').toDate();
  toDate: Date = moment(this.today).endOf('day').toDate();
  configParam = null;
  dataObj = { view: 'listDetails', viewBoardID: '' };
  gridView: any;
  listUserTask = [];
  listNode = [];
  isFinishLoad = false;
  taskAction: any;
  countOwner = 0;
  model = new DataRequest();
  openNode = false;
  iterationID: string=''
  @Input('viewBase') viewBase: ViewsComponent;
  @Input() funcID: string;
  @ViewChild('listview') listview: CodxListviewComponent;
  constructor( private tmSv: TmService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.authStore.get();
    // this.iterationID = this.activedRouter.snapshot.params["id"];
  }

  ngOnInit(): void {
   
    this.loadData();
  }
  loadData() {
    this.activedRouter.firstChild?.params.subscribe(data=>this.iterationID=data.id);
    this.funcID =this.activedRouter.snapshot.params["funcID"];
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'SprintsTasks';
    model.gridViewName = 'grvSprintTasks';
    model.entityName = 'TM_SprintTasks';
    model.predicate = '';
    this.fromDate = moment('4/20/2022').toDate();
    this.toDate = moment('12/30/2022').toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.toDate },
      ],
    };
    var dataObj = { view: '',calendarID:'', viewBoardID: this.iterationID };
    model.dataObj = JSON.stringify(dataObj);
    this.model = model;
  }
  
  clickItem(item) {
    this.openNode = false;
    this.getOneItem(item.id);
  }
  getOneItem(id) {
    var itemDefault = this.data.find((item) => item.id == id);
    if (itemDefault != null) {
      this.itemSelected = itemDefault;
    } else {
      this.itemSelected = this.data[0];
    }
   this.loadDetailTask(this.itemSelected) ;
  }
  loadDetailTask(task) {
    this.objectAssign = "";
    this.objectState = "";
    if (task.category == '3' || task.category == '4') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskByParentIDAsync',
          [task?.recID]
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.countOwner = res.length;
            let objectId = res[0].owner;
            let objectState = res[0].status;
            for (let i = 1; i < res?.length; i++) {
              objectId += ';' + res[i].owner;
              objectState += ';' + res[i].status;
            }
            this.objectAssign = objectId;
            this.objectState = objectState;
          }
        });
    } else {
      this.countOwner = 1;
    }
     this.listNode = []
    if (task?.category != '1') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTasksTreeAsync',
          task?.id
        )
        .subscribe((res) => {
          this.listNode = res;
        });
    }
    this.isFinishLoad = true;
  }

  changeRowSelected(event) {
    this.itemSelected = event;
    this.loadDetailTask(this.itemSelected);
    this.data = this.listview?.data;
    if (this.itemSelected != null) {
      this.isFinishLoad = true;
    } else this.isFinishLoad = false;
  }
  openShowNode() {
    this.openNode = !this.openNode;
  }
}
