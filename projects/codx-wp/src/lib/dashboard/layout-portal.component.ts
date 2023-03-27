
import { Component, OnInit, Injector } from '@angular/core';
import { CacheService, CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss'],
})
export class LayoutPortalComponent extends LayoutBaseComponent {
  module = 'WP';
  funcID: string = '';
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  //override asideKeepActive = false;
  override toolbar = false;
  dialog!: DialogRef;
  showCodxChat:boolean = false;
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private callfc: CallFuncService,
    private cache:CacheService
  ) 
  {
    super(inject);
  }

  onInit() {
    this.checkShowCodxChat();
  }
  onAfterViewInit(): void {}
  checkShowCodxChat(){
    this.cache.functionList("WPT11").subscribe((func:any) => {
      this.showCodxChat = func ? true : false;
    });
  }
  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
