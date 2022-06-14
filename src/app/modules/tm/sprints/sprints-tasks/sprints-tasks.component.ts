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
  ViewsComponent,
} from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-sprints-tasks',
  templateUrl: './sprints-tasks.component.html',
  styleUrls: ['./sprints-tasks.component.scss'],
})
export class SprintsTasksComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('sprintsTaskDetails') sprintsTaskDetails: TemplateRef<any> | null;
  user: any;
  funcID: any;
  iterationID: string;
  model = new DataRequest();
  views: Array<ViewModel> = [];

  constructor(
    private tmSv: TmService,
    private notiService: NotificationsService,
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
    this.views = [
      {
        id: '1',
        type: 'listdetail',
        icon: 'icon-chrome_reader_mode1',
        text: 'List-details',
        active: true,
        model: {
          panelLeftRef: this.sprintsTaskDetails,
          sideBarLeftRef: this.asideLeft,
        },
      },
      {
        id: '2',
        type: 'list',
        icon: 'icon-format_list_bulleted',
        text: 'List-tasks',
        active: false,

        model: {
          // panelLeftRef: this.listTasks,
          sideBarLeftRef: this.asideLeft,
        },
      },
      {
        id: '3',
        type: 'kanban',
        active: false,
        model: {
          //  panelLeftRef: this.kanban,
          sideBarLeftRef: this.asideLeft,
        },
      },
      {
        id: '4',
        type: 'schedule',
        text: 'schedule',
        active: false,
        model: {
          //  panelLeftRef: this.schedule,
          sideBarLeftRef: this.asideLeft,
        },
      },
    ];
  }
}
