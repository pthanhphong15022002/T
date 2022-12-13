import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, CodxService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable } from 'rxjs';
import { CodxMwpService } from '../codx-mwp.service';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  module = 'MWP';
  dialog!: DialogRef;

  override aside = true;
  override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = true;
  constructor(inject: Injector,
    private callfc: CallFuncService,
    private mwpService : CodxMwpService
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
  childMenuClick(e) {
    this.mwpService.childMenuClick.next(e);
  }
}
