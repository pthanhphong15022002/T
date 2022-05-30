import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewsComponent } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { ViewBoardInfoComponent } from './view-board-info/view-board-info.component';

@Component({
  selector: 'app-view-boards',
  templateUrl: './view-boards.component.html',
  styleUrls: ['./view-boards.component.scss']
})
export class ViewBoardsComponent implements OnInit {

  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('listViewBoards') listViewBoards : TemplateRef<any>|null
  @ViewChild('viewBoardInfo') viewBoardInfo: ViewBoardInfoComponent;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any> | null;

  constructor(private cf: ChangeDetectorRef) { }

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [
    {
      id: '1',
      icon: 'icon-list-checkbox',
      text: 'Settings',
    }
  ]

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '2',
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.listViewBoards,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '600px'
      }
    }];
    this.cf.detectChanges();
  }

  click(evt: any) {
    console.log(evt.id);
    switch (evt.id) {
      case 'add':
        // this.viewBoardInfo.();
        this.viewBoardInfo.title = 'Task Board';
        this.viewBase.currentView.openSidebarRight();
        break;
      case '1':
        this.viewBase.currentView.openSidebarRight();
        break;
      default:
        break;
    }
  }
}

