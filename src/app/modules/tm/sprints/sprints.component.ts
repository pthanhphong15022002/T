import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewsComponent } from 'codx-core';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { SprintsInfoComponent } from './sprints-info/sprints-info.component';

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
      type: 'content',
      active: true,
      model: {
        panelLeftRef: this.listSprints,
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
        this.sprintsInfo.openSprints() ;
        this.sprintsInfo.title = 'Task Board';
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

