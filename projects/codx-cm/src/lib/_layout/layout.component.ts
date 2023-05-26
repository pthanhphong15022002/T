import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable, of } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private codxCM: CodxCmService,
  ) {
    super(inject);
    this.module = 'CM';
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
  childMenuClick(e){
    if(e &&e?.recID){
      this.codxCM.childMenuClick.next(e.recID);
    }
  }
}
