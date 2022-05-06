import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewBaseComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('kanban') kanban: TemplateRef<any>;
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('listTasks') listTasks: TemplateRef<any>;
  @ViewChild('schedule') schedule: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any> | null;
  // @ViewChild("sidebar") sidebar :TaskInfoComponent ;
  @ViewChild("task-info") taskInfo : TaskInfoComponent;

  @ViewChild('sidebar') sidebar: SidebarComponent;
  public showBackdrop: boolean = true;
  public type: string = 'Push';
  public width: string = '550px';
  public closeOnDocumentClick: boolean = true;
 

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  constructor(private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buttons = [
      {
        id: '1',
        icon: 'icon-list-checkbox',
        text: 'button 1',
      },
      {
        id: '2',
        icon: 'icon-list-checkbox',
        text: 'button 2',
      },
    ];

    this.moreFunc = [
      {
        id: '1',
        icon: 'icon-list-checkbox',
        text: 'more 1',
      },
      {
        id: '2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.panelLeftRef
      }
    },
    {
      id: '2',
      type: 'kanban',
      active: false,
      model: {
        panelLeftRef: this.kanban,
      }
    },
    {
      id: '3',
      type: 'kanban',
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: false,
      model: {
        panelLeftRef: this.listDetails,
        sideBarLeftRef: this.asideLeft,
        //       itemTemplate: this.itemTemplate,
      }
    },
    {
      id: '4',
      type: 'list',
      icon: 'icon-format_list_bulleted',
      text: 'List-tasks',
      active: false,
      model: {
        panelLeftRef: this.listTasks,
        sideBarLeftRef: this.asideLeft,
        // itemTemplate: this.itemTemplate,
      }
    },
    {
      id: '5',
      type: 'schedule',
      text: 'schedule',
      active: false,
      model: {
        panelLeftRef: this.schedule,
        sideBarLeftRef: this.asideLeft,
        // itemTemplate: this.itemTemplate,
      }
    },
    ];
    this.cf.detectChanges();
  }

  click(evt: any) {
    console.log(evt);
    this.sidebar.show();

  }

  public onCreated(args: any) {
    this.sidebar.element.style.visibility = '';
    this.sidebar.position ="Right";
  }
  closeClick(): void {
    this.sidebar.hide();
  }
}
