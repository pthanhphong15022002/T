import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, ButtonModel, DataRequest, NotificationsService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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

  @ViewChild('itemTemplate') template!: TemplateRef<any>;

  user: any;
  funcID: any;
  iterationID: string = '';
  model = new DataRequest();
  views: Array<ViewModel> = [];
  viewsActive: Array<ViewModel> = [];
  itemSelected: any;
  moreFuncs: Array<ButtonModel> = [];
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
        // sideBarLeftRef: this.asideLeft,
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
      model: {
        template: this.sprintsKanban,
        // sideBarLeftRef: this.asideLeft,
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
      model: {
        template: this.sprintsSchedule,
        // sideBarLeftRef: this.asideLeft,
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
        }
      });
    }
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
