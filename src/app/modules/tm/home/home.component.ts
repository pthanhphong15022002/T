import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('view') view: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('kanban') kanban: TemplateRef<any>;
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('listTasks') listTasks: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;



  constructor() {}

  views: Array<ViewModel> = [{
    id: '1',
    type: 'content',
    active: false
  },
  {
    id: '2',
    type: 'kanban',
    active: false
  }, {
    id: '3',
    type: 'content',
    icon: 'icon-chrome_reader_mode1',
    text:'List-details',
    active: true
  },
  {
    id: '4',
    type: 'list',
    text:'List-tasks',
    active: false
  }];
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'content',
      active: false,
    },
    {
      id: '2',
      type: 'kanban',
      active: false,
      model: {
        panelLeftRef: this.kanban,
        sideBarLeftRef: this.asideLeft,
      }
    },
    {
      id: '3',
      type: 'content',
      icon: 'icon-chrome_reader_mode1',
      text: 'List-details',
      active: false,
      model: {
        panelLeftRef: this.listDetails,
        sideBarLeftRef: this.asideLeft,
      }
    },{
      id: '4',
      type: 'list',
      text:'List-task',
      active: false,
      model: {
        panelLeftRef: this.listTasks,
        sideBarLeftRef: this.asideLeft,
        itemTemplate: this.itemTemplate,
      }
    }];
  }
}
