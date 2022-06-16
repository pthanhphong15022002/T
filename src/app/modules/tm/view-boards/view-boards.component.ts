import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { ViewBoardInfoComponent } from './view-board-info/view-board-info.component';

@Component({
  selector: 'app-view-boards',
  templateUrl: './view-boards.component.html',
  styleUrls: ['./view-boards.component.scss']
})
export class ViewBoardsComponent implements OnInit {

  @ViewChild('view') viewBase: ViewsComponent;

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
      type: ViewType.content,
      active: true
    }];
    this.cf.detectChanges();
  }

  click(evt: any) {
    console.log(evt.id);
    switch (evt.id) {
      case 'add':
        // this.viewBoardInfo.();
        this.viewBoardInfo.title = 'Task Board';
        // //this.viewBase.currentView.openSidebarRight();
        break;
      case '1':
        //  //this.viewBase.currentView.openSidebarRight();
        break;
      default:
        break;
    }
  }
}

