import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, ButtonModel, DataRequest, NotificationsService, ResourceModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'lib-sprints-tasks',
  templateUrl: './sprints-tasks.component.html',
  styleUrls: ['./sprints-tasks.component.css']
})
export class SprintsTasksComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeft?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('sprintsTaskDetails') sprintsTaskDetails: TemplateRef<any> | null;
  @ViewChild('sprintsListTasks') sprintsListTasks: TemplateRef<any> | null;
  @ViewChild('sprintsKanban') sprintsKanban: TemplateRef<any> | null;
  @ViewChild('sprintsCalendar') sprintsCalendar: TemplateRef<any> | null;
  @ViewChild('sprintsSchedule') sprintsSchedule: TemplateRef<any> | null;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>| null;
  @ViewChild('itemTemplate') template!: TemplateRef<any>| null;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];
  gridView:any
  user: any;
  funcID: any;
  iterationID: string = '';
  model = new DataRequest();
  views: Array<ViewModel> = [];
  viewsActive: Array<ViewModel> = [];
  itemSelected: any;
  moreFuncs: Array<ButtonModel> = [];
  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'userID' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };

  constructor(
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private cf: ChangeDetectorRef,
    private activedRouter: ActivatedRoute,
  ) {
    this.user = this.authStore.get();
    this.activedRouter.firstChild?.params.subscribe(
      (data) => (this.iterationID = data.id)
    );
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    var dataObj = { view: '', calendarID: '', viewBoardID: this.iterationID };
    this.model.dataObj = JSON.stringify(dataObj);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'TM';
    this.modelResource.className = 'TaskBusiness';
    this.modelResource.service = 'TM';
    this.modelResource.method = 'GetUserByTasksAsync';

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'TM';
    this.resourceKanban.assemblyName = 'TM';
    this.resourceKanban.className = 'TaskBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.loadData();
  }
  loadData() {
    this.viewsActive = [{
      id: '1',
      type: ViewType.list,
      icon: 'icon-format_list_bulleted',
      text: 'List-tasks',
      sameData: true,
      active: false,
      model: {
        template: this.template,
      },
    },
    {
      id: '2',
      type: ViewType.listdetail,
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      sameData: true,
      active: false,
      model: {
        template: this.template,
        panelRightRef: this.panelRight,
      },
    },
    {
      id: '6',
      type: ViewType.kanban,
      sameData: true,
      active: false,
      // request2: this.resourceKanban,
        model: {
          template: this.sprintsKanban,
        },
    },
    {
      id: '7',
      type: ViewType.calendar,
      sameData: true,
      text: 'calendar',
      active: false,
      model: {
         template: this.sprintsCalendar,
        //sideBarLeftRef: this.asideLeft,
      },
    },
    {
      id: '8',
      type: ViewType.schedule,
      sameData: true,
      text: 'schedule',
      active: false,
      // request2: this.modelResource,
      model: {
        // eventModel: this.fields,
        // resourceModel: this.resourceField,
        // template: this.eventTemplate,
        // template3: this.sprintsSchedule,
      },
    },
    ];

    if (this.iterationID == '') {
      this.viewsActive.forEach((obj) => {
        if (obj.id == '1') {
          obj.active = true;
        }
      });
      this.views = this.viewsActive
      this.dt.detectChanges() ;
    } else {
      this.tmSv.getSprints(this.iterationID).subscribe((res) => {
        if (res) {
          var viewDefaultID = res.viewMode;
          this.viewsActive.forEach((obj) => {
            if (obj.id == viewDefaultID) {
              obj.active = true;
            }
          });
          this.views = this.viewsActive
          this.dt.detectChanges() ;
        }
      });
    }
    
  }
  
 

  changeView(evt: any) {}

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    console.log(evt);
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate, logic: 'and' },
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
      ],
    };
    //reload data
    // this.schedule.reloadDataSource();
    // this.schedule.reloadResource();
  }

  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
          }
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
        }
      }
    }

    return ``;
  }

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  onDragDrop(e: any) {
    // if (e.type == 'drop') {
    //   this.api
    //     .execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', e.data)
    //     .subscribe((res) => {
    //       if (res) {
    //         this.view.dataService.update(e.data);
    //       }
    //     });
    }
  
  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.dt.detectChanges() ;
  }

  clickMF(e: any, data: any) {
    // switch (e.functionID) {
    //   case 'btnAdd':
    //     this.show();
    //     break;
    //   case 'edit':
    //     this.edit();
    //     break;
    //   case 'delete':
    //     this.delete(data);
    //     break;
    // }
  }
  click(evt: ButtonModel) {
    // switch (evt.id) {
    //   case 'btnAdd':
    //     this.show();
    //     break;
    //   case 'edit':
    //     this.edit();
    //     break;
    //   case 'delete':
    //     this.delete(evt);
    //     break;
    // }
  }
}
