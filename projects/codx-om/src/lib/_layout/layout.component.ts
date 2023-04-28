import { ViewEncapsulation } from '@angular/core';
import { Component, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent, SidebarModel
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef
  constructor(inject: Injector,
    //private hideToolbar: CodxOdService,
    private callfc: CallFuncService,
  ) {
    super(inject);
    this.module = 'OM';
    this.layoutModel.toolbarFixed = false;
  }

  onInit() { }

  onAfterViewInit() {
    // this.hideToolbar.SetLayout.subscribe(res => {
    //   if (res != null)
    //     this.setToolbar(res);
        
    // })
  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }
}
