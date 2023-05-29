import { Component, OnInit, Injector } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss'],
})
export class LayoutPortalComponent extends LayoutBaseComponent {
  funcID: string = '';
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private callfc: CallFuncService,
    private cache: CacheService,
    private shareService: CodxShareService
  ) {
    super(inject);
    this.module = 'WP';
    this.layoutModel.asideFixed = false;
    this.layoutModel.asideTheme = 'transparent';
    this.layoutModel.asideMinimize = 'icon';
    this.layoutModel.toolbarDisplay = false;
  }

  onInit() {}
  asideClick(evt: any) {
    if (evt.funcId == 'HCS_001') {
      evt.cancel = true;
      this.shareService.loginHCS().subscribe((token) => {
        let returnUrl = 'https://surehcs.lacviet.vn/UI2017';
        let url = `http://surehcs.lacviet.vn/UI2017/verifytoken.aspx?tklid=${token}&returnUrl=${returnUrl}`;
        if (url != '') {
          window.open(url, '_blank');
        }
      });
      console.log('evt click', evt);
    }
  }
  onAfterViewInit(): void {}
  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
