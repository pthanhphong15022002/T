import { Observable } from 'rxjs';
import {
  Component,
  ViewChild,
  ElementRef,
  Injector,
  ViewEncapsulation,
} from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { NotifyDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/notify-drawer.component';
import { ActivatedRoute } from '@angular/router';
import { CodxTMService } from '../codx-tm.service';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: string = '';
  
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private tmService: CodxTMService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = 'TM';
  }

  onInit(): void {}

  childMenuClick(e) {
    this.tmService.childMenuClick.next(e);
  }
  menuClick(e) {}
  onAfterViewInit(): void {}

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
