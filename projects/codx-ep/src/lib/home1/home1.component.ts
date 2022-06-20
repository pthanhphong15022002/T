import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { RoomComponent } from '../room/room.component';

@Component({
  selector: 'app-home1',
  templateUrl: './home1.component.html',
  styleUrls: ['./home1.component.scss'],
})
export class Home1Component implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('kanban') kanban: TemplateRef<any>;
  @ViewChild('listDetails') listDetails: TemplateRef<any>;
  @ViewChild('listTasks') listTasks: TemplateRef<any>;
  @ViewChild('schedule') schedule: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any> | null;
  @ViewChild('editRoomResource') editRoomResource: TemplateRef<any>;
  @ViewChild('room') room: TemplateRef<any>;
  @ViewChild('room1') room1: RoomComponent;
  @ViewChild('editRoomBooking') editRoomBooking: TemplateRef<any>;

  public showBackdrop: boolean = true;
  public type: string = 'Push';
  public width: string = '800px';
  public closeOnDocumentClick: boolean = true;

  public data = {};
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  isAdd = true;
  editResourece = [];
  height = '300';
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
    this.views = [
      {
        sameData: false,
        id: '1',
        type:ViewType.content,
        active: false,
        model: {
          panelLeftRef: this.panelLeftRef,

        },
      },

      {
        sameData: false,
        id: '3',
        type: ViewType.kanban,
        icon: 'icon-chrome_reader_mode1',
        text: 'List-details',
        active: false,
        model: {
          panelLeftRef: this.listDetails,

        },
      },
      {
        sameData: false,
        id: '4',
        type: ViewType.list,
        icon: 'icon-format_list_bulleted',
        text: 'List-tasks',
        active: false,
        model: {
          panelLeftRef: this.listTasks,

        },
      },
      {
        sameData: false,
        id: '5',
        type: ViewType.schedule,
        active: false,
        model: {
          panelLeftRef: this.schedule,

        },
      },
    ];
    this.cf.detectChanges();
  }

  click(evt: any) {
    this.data = evt;
    console.log(evt);
    //this.viewBase.currentView.openSidebarRight()
    this.cf.detectChanges();
  }
  changeHeight() {
    this.room1.gridView;
  }
  closeEditForm() {
    //this.viewBase.currentView.closeSidebarRight();
  }
}
