import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
<<<<<<< HEAD:src/app/modules/tm/view-boards/view-boards.component.ts
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { ViewBoardInfoComponent } from './view-board-info/view-board-info.component';
=======
import { ViewsComponent } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { SprintsInfoComponent } from './sprints-info/sprints-info.component';
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9:src/app/modules/tm/sprints/sprints.component.ts

@Component({
  selector: 'app-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsComponent implements OnInit {

  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('listSprints') listSprints : TemplateRef<any>|null
  @ViewChild('sprintsInfo') sprintsInfo: SprintsInfoComponent;
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
<<<<<<< HEAD:src/app/modules/tm/view-boards/view-boards.component.ts
      type: ViewType.content,
      active: true
=======
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.listSprints,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '600px'
      }
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9:src/app/modules/tm/sprints/sprints.component.ts
    }];
    this.cf.detectChanges();
  }

  click(evt: any) {
    console.log(evt.id);
    switch (evt.id) {
      case 'add':
<<<<<<< HEAD:src/app/modules/tm/view-boards/view-boards.component.ts
        // this.viewBoardInfo.();
        this.viewBoardInfo.title = 'Task Board';
        // //this.viewBase.currentView.openSidebarRight();
=======
        this.sprintsInfo.openSprints() ;
        this.sprintsInfo.title = 'Task Board';
        this.viewBase.currentView.openSidebarRight();
>>>>>>> 55e18d0366fad3bc7822d0c6b9ea171d2faf90d9:src/app/modules/tm/sprints/sprints.component.ts
        break;
      case '1':
        //  //this.viewBase.currentView.openSidebarRight();
        break;
      default:
        break;
    }
  }
}

