import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { AlertDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/alert-drawer/alert-drawer.component';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { NotifyDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/notify-drawer.component';
import { PopupAddNotifyComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/popup-add-notify/popup-add-notify.component';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  module = 'FD';
  dialog!: DialogRef;
  override aside = true;
  override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector,
    private callfc: CallFuncService,
    ) {
    super(inject);
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }
  openFormNotifyDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NotifyDrawerComponent, "FDT01", option);
  }
}
