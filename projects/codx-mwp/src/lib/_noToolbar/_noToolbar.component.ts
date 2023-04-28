import { Component, OnInit, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { Observable } from 'rxjs';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
@Component({
  selector: 'lib-layoutNoToolbar',
  templateUrl: './_noToolbar.component.html',
  styleUrls: ['./_noToolbar.component.scss'],
})
export class LayoutNoToolbarComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'MWP';
    this.layoutModel.toolbarDisplay=false;
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
