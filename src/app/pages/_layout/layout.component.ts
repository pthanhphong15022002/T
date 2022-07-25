import { DialogRef } from 'codx-core/public-api';
import { Component, OnInit, Injector } from '@angular/core';
import { NoteDrawerComponent } from '@shared/layout/drawers/note-drawer/note-drawer.component';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'WP';
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;
  dialog!: DialogRef;

  constructor(inject: Injector,
    private callfc: CallFuncService) {
    super(inject);
  }

  onInit() { }

  onAfterViewInit() {

  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }

}
