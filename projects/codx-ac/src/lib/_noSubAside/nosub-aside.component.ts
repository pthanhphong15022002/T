import { Component, Injector, OnInit } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-nosub-aside',
  templateUrl: './nosub-aside.component.html',
  styleUrls: ['./nosub-aside.component.css']
})
export class NosubAsideComponent extends LayoutBaseComponent {
  // toolbar = false;
  childMenu = new BehaviorSubject<any>(null);
  constructor(
    inject: Injector,
    private callfc: CallFuncService
  ) { 
    super(inject);
    this.module = 'AC';
  }

  onInit(): void { }

  onAfterViewInit(): void { }

  childMenuClick(e) {
    this.childMenu.next(e.recID);
  }
  menuClick(e) {}
  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    var dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    dialog.closed.subscribe();
  }

}
