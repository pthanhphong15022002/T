import { DialogRef } from 'codx-core/public-api';
import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-layout',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends LayoutBaseComponent {
  module = 'WP';
  funcID:string = "";
  override asideFixed = false;
  override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;  
  dialog!: DialogRef;

  constructor(inject: Injector,
    private route:ActivatedRoute,
    private callfc: CallFuncService) {
    super(inject);
  }

  onInit() { 
    this.route.params.subscribe((res:any) => {
      if(res) console.log(res);
    })
  }

  onAfterViewInit() {

  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }


  openFormAlertRule(){
  }
}
