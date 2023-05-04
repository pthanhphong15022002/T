import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AsideComponent, CodxService } from 'codx-core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  @ViewChild('aside') asideRef: AsideComponent;
  constructor(
    inject: Injector,
    private codxShareService: CodxShareService,
    private callfc: CallFuncService
  ) {
    super(inject);

    this.module = 'AC';
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
