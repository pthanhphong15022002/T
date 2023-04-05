import { Component, OnInit, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'lib-layout-instances',
  templateUrl: './layout-instances.component.html',
  styleUrls: ['./layout-instances.component.css'],
})
export class LayoutInstancesComponent extends LayoutBaseComponent {
  module = '';
  override aside = false;
  override toolbarFixed = false;
  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  //override toolbar = false;
  dataProcess = new BehaviorSubject<any>(null);
  nameProcess = '';
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

  onAfterViewInit(): void {}

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.callfc.openSide(NoteDrawerComponent, '', option);
  }
  viewNameProcess() {
    this.dataProcess.subscribe((data) => {
      this.nameProcess = data.title;
      return this.nameProcess
    });
  }
}
