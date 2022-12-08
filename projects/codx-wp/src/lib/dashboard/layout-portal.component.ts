import { DialogRef } from 'codx-core/public-api';
import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { ActivatedRoute } from '@angular/router';
import { SignalRService } from '../services/signalr.service';

@Component({
  selector: 'lib-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss']
})
export class LayoutPortalComponent extends LayoutBaseComponent {
  
  module = 'WP';
  funcID:string = "";
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;  
  dialog!: DialogRef;

  constructor(inject: Injector,
    private route:ActivatedRoute,
    private callfc: CallFuncService,
    private signalRSV: SignalRService  
  )
  {
    super(inject);
  }

  onInit() 
  {

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
