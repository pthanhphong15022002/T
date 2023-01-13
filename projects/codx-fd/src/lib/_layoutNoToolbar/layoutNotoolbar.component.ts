import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { AlertDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/alert-drawer/alert-drawer.component';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
@Component({
  selector: 'lib-layout-notoolbar',
  templateUrl: './layoutNotoolbar.component.html',
  styleUrls: ['./layoutNotoolbar.component.css'],
})
export class LayoutNotoolbar extends LayoutBaseComponent {
  
  module = 'FD';
  dialog!: DialogRef;
  override aside = true;
  override asideFixed = true;
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
}
