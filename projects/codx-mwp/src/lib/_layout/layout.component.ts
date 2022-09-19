import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, CodxService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  module = 'MWP';
  dialog!: DialogRef;

  // override aside = true;
  // override asideFixed = true;
  // // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  // override toolbar = true;
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
