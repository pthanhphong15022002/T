import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';

@Component({
  selector: 'lib-layout4',
  templateUrl: './layout4.component.html',
  styleUrls: ['./layout4.component.scss'],
})
export class Layout4Component extends LayoutBaseComponent {

  module = "EP4";
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private callfc: CallFuncService,
  ) {
    super(inject);
  }
  onInit(): void {

  }

  onAfterViewInit(): void {

  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }
}
