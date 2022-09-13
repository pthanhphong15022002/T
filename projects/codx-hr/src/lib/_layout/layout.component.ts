import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent {

  module = 'HR';
  dialog!: DialogRef;

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
