import { CodxShareService } from '../../codx-share.service';
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
  selector: 'lib-layoutNoAside',
  templateUrl: './_noAsideToolbarFluid.component.html',
  styleUrls: ['./_noAsideToolbarFluid.component.css'],
})
export class LayoutNoAsideToolbarFluidComponent extends LayoutBaseComponent {
  module = '';
  override aside = false;
  dialog!: DialogRef;
  override asideFixed = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;
  constructor(
    inject: Injector,
    private codxShareService: CodxShareService,
    private callfc: CallFuncService
  ) {
    super(inject);
  }

  onInit(): void {
    this.codxShareService.hideAside.subscribe((res) => {
      if (res != null) this.setAside(res);
    });
  }

  onAfterViewInit(): void { }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
