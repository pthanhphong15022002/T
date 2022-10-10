import { DialogRef } from 'codx-core/public-api';
import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { NotifyDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/notify-drawer.component';
import { ActivatedRoute } from '@angular/router';
import { SettingNotifyDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/setting-notify-drawer/setting-notify-drawer.component';
import { PopupAddNotifyComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/popup-add-notify/popup-add-notify.component';

@Component({
  selector: 'lib-layout',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends LayoutBaseComponent {
  module = 'WP';
  funcID:string = "";
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;  
  dialog!: DialogRef;

  constructor(inject: Injector,
    private route:ActivatedRoute,
    private callfc: CallFuncService) {
    super(inject);
  }

  onInit() { 
  }

  onAfterViewInit() {

  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }


  openFormAlertRule(){
  }
}
