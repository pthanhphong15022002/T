import { Observable } from 'rxjs';
import { Component, ViewChild, ElementRef, Injector, ViewEncapsulation } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent, SidebarModel
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'TM';
  dialog!: DialogRef;

  constructor(inject: Injector,
    private callfc: CallFuncService) {
    super(inject);
  }

  onInit(): void {
    // this.funcs$.subscribe(res => {
    //   console.log(res);

    // })
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
