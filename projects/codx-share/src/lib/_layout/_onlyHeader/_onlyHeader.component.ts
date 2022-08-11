import { Component, OnInit, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { Observable } from 'rxjs';
import { NoteDrawerComponent } from '../../layout/drawers/note-drawer/note-drawer.component';
@Component({
  selector: 'lib-layoutOnlyHeader',
  templateUrl: './_onlyHeader.component.html',
  styleUrls: ['./_onlyHeader.component.css'],
})
export class LayoutOnlyHeaderComponent extends LayoutBaseComponent {
  module = '';
  dialog!: DialogRef;
  override aside = false;
  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
