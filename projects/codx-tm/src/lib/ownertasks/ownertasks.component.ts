import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Injector,
  Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  ViewModel,
  ViewsComponent,
  ViewType,
  RequestOption,
  ButtonModel,
  ResourceModel,
  CallFuncService,
  SidebarModel,
  DialogRef,
  ApiHttpService,
  AuthStore,
  CodxScheduleComponent,
} from 'codx-core';
import { TM_Tasks } from '../models/TM_Tasks.model';
import { PopupAddComponent } from './popup-add/popup-add.component';
@Component({
  selector: 'test-views',
  templateUrl: './ownertasks.component.html',
  styleUrls: ['./ownertasks.component.scss'],
})
export class OwnerTasksComponent implements OnInit {
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeft?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('cardCenterTemplate') cardCenterTemplate!: TemplateRef<any>;
  @ViewChild('kanbanTemplate') kanbanTemplate?: TemplateRef<any>;
  @ViewChild('scheduleTemplate') scheduleTemplate: TemplateRef<any>;
  @ViewChild('tmpRight') sidebarRight?: TemplateRef<any>;
  @ViewChild('eventModel') eventModel?: TemplateRef<any>;
  // @ViewChild("schedule") schedule: CodxScheduleComponent;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  dialog!: DialogRef;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];
  // resourceField: any;
  eventStatus: any;
  itemSelected : any ;
  user : any 
  funcID : string
  gridView: any;
  @Input() calendarID: string;

  @Input() viewPreset: string = "weekAndDay";

  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private activedRouter : ActivatedRoute
  ) { 
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  clickMF(e: any, data: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit();
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit();
        break;
      case 'delete':
        this.delete(evt);
        break;
    }
  }

  ngOnInit(): void {
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
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
    this.getParams();
  }
  change() {
    // this.view.dataService.dataValues = "1";
    // this.view.dataService.load();
    this.view.dataService.setPredicates(["Status=@0"], ["1"]);

  }
  ngAfterViewInit(): void {
    // this.noti.notifyCode('DM012')
    this.views = [
      {
        type: ViewType.list,
      
        sameData: true,
        model: {
          template: this.template,
        },
      },
      {
        type: ViewType.card,
        sameData: true,
        model: {
          template: this.cardTemplate,
        },
      },
      {
        type: ViewType.card,
        text: 'List card center',
        sameData: true,
        model: {
          template: this.cardCenterTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.content,
        sameData: true,
        model: {
          panelRightRef: this.panelRight,
          panelLeftRef: this.panelLeft,
        },
      },
      {
        type: ViewType.kanban,
        sameData: true,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
          panelLeftRef: this.kanbanTemplate,
        },
      },
      {
        active: false,
        type: ViewType.grid,
        sameData: true,
      },
      {
        type: ViewType.schedule,
        sameData: true,
        active: true,
        request2: this.modelResource,
        model:{
          panelLeftRef: this.panelLeft,
          eventModel:  this.fields,
          resourceModel: this.resourceField,
          contextMenu: '',
          template: this.scheduleTemplate,
        }
      }
    ];

  
    this.view.dataService.predicates = "Status=@0";
    this.view.dataService.dataValues = "1";
    this.view.dataService.methodSave = 'TestApiSave';
    this.view.dataService.methodUpdate = 'TestApiBool';
    this.view.dataService.methodDelete = 'TestApi';
    console.log(this.view.formModel);
    this.dt.detectChanges();
  }
  //#region schedule

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: "userID" },
  }
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };

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
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' }
      ]
    }
    //reload data
    // this.schedule.reloadDataSource();
    // this.schedule.reloadResource();

  }

  getCellContent(evt: any) {

    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (day && evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach(item => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            })
          }
          return '<icon class="' + this.dayoff[i].symbol + '"></icon>' + '<span>' + this.dayoff[i].note + '</span>'
        }
      }
    }
    
    return ``;
  }

  getParams() {
    this.api.execSv<any>('SYS', 'ERM.Business.CM', 'ParametersBusiness', 'GetOneField', ['TM_Parameters', null, 'CalendarID']).subscribe(res => {
      if (res) {
        this.calendarID = res.fieldValue;
        this.getDayOff(this.calendarID);
      }
    })
  }

  getDayOff(id = null) {
    if (id)
      this.calendarID = id;
    this.api.execSv<any>('BS', 'ERM.Business.BS', 'CalendarsBusiness', 'GetDayWeekAsync', [this.calendarID]).subscribe(res => {
      if (res) {
        console.log(res);
        res.forEach(ele => {
          this.dayoff = res;
        });
      }
    })
  }
  //#endregion schedule

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(PopupAddComponent, this.view.dataService.dataSelected, option);
      //dialog.close();
    });
  }

  edit() {
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(PopupAddComponent, this.view.dataService.dataSelected, option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], this.beforeDel).subscribe();
  }


  beforeDel(opt: RequestOption) {
    opt.service = 'TM';
    opt.assemblyName = 'TM';
    opt.className = 'TaskBusiness';
    opt.methodName = 'TestApi';
    return true;
  }

  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  aaa(val: any) {
    console.log(val);
  }
  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.dt.detectChanges() ;
  }
}
