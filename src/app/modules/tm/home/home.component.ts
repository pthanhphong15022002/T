import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

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

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  constructor(private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.buttons = [{
      id: '1',
      icon: 'icon-list-checkbox',
      text: 'button 1',
    },
    {
      id: '2',
      icon: 'icon-list-checkbox',
      text: 'button 2',
    }]

    this.moreFunc = [{
      id: '1',
      icon: 'icon-list-checkbox',
      text: 'more 1',
    },
    {
      id: '2',
      icon: 'icon-list-checkbox',
      text: 'more 2',
    }]
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
    },
    {
      id: '3',
      type: 'listdetail',
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
  }
}
