import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmService } from '@modules/tm/tm.service';
import {
  ApiHttpService,
  AuthStore,
  DataRequest,
  NotificationsService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';


@Component({
  selector: 'app-sprints-tasks',
  templateUrl: './sprints-tasks.component.html',
  styleUrls: ['./sprints-tasks.component.scss'],
})
export class SprintsTasksComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('sprintsTaskDetails') sprintsTaskDetails: TemplateRef<any> | null;
  @ViewChild('sprintsListTasks') sprintsListTasks: TemplateRef<any> | null;
  @ViewChild('sprintsKanban') sprintsKanban: TemplateRef<any> | null;
  @ViewChild('sprintsCalendar') sprintsCalendar: TemplateRef<any> | null;
  @ViewChild('sprintsSchedule') sprintsSchedule: TemplateRef<any> | null;
  user: any;
  funcID: any;
  iterationID: string = '';
  model = new DataRequest();
  views: Array<ViewModel> = [

  ];
  viewsActive: Array<ViewModel> = [];

  constructor(
    private tmSv: TmService,
    private notiService: NotificationsService,
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private cf: ChangeDetectorRef,
    private activedRouter: ActivatedRoute
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
      active: false,
      model: {
        panelLeftRef: this.sprintsListTasks,
        // sideBarLeftRef: this.asideLeft,
      },
    },
    {
      id: '2',
      type: ViewType.listdetail,
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: false,
      model: {
        panelLeftRef: this.sprintsTaskDetails,
        // sideBarLeftRef: this.asideLeft,
      },
    },
    {
      id: '6',
      type: ViewType.kanban,
      active: false,
      model: {
        panelLeftRef: this.sprintsKanban,
        // sideBarLeftRef: this.asideLeft,
      },
    },
    {
      id: '7',
      type: ViewType.calendar,
      text: 'calendar',
      active: false,
      model: {
        panelLeftRef: this.sprintsCalendar,
        //sideBarLeftRef: this.asideLeft,
      },
    },
    {
      id: '8',
      type: ViewType.schedule,
      text: 'schedule',
      active: false,
      model: {
        panelLeftRef: this.sprintsSchedule,
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
}
