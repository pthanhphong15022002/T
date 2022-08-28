import { Component, Injector, OnInit } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from '../../layout/drawers/note-drawer/note-drawer.component';

@Component({
  selector: 'lib-noSubAside',
  templateUrl: './_noSubAside.component.html',
  styleUrls: ['./_noSubAside.component.css']
})
export class NoSubAsideComponent extends LayoutBaseComponent {

  module = '';
  // aside=true;
  // asideFixed = true;
  // toolbar = false;
  constructor(
    inject: Injector,
    private callfc: CallFuncService
  ) {
    super(inject);

  }

  onInit(): void { }

  onAfterViewInit(): void { }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    var dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    dialog.closed.subscribe();
  }
}
