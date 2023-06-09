import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';

@Component({
  selector: 'lib-noSubAside',
  templateUrl: './_noSubAside.component.html',
  styleUrls: ['./_noSubAside.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoSubAsideComponent extends LayoutBaseComponent {
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'AD';
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    var dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    dialog.closed.subscribe();
  }
}
