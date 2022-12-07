import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { SignalRService } from '../services/signalr.service';

@Component({
  selector: 'lib-layout-chat',
  templateUrl: './layout-chat.component.html',
  styleUrls: ['./layout-chat.component.css']
})
export class LayoutChatComponent extends LayoutBaseComponent {

  module = 'WP';
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;  
  constructor
  (
    private inject: Injector,
    private callfc:CallFuncService,
    private signalRSV: SignalRService  
  ) 
  {
    super(inject)
  }

  onInit(): void {
    throw new Error('Method not implemented.');
  }
  onAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.callfc.openSide(NoteDrawerComponent, '', option);

  }
}
