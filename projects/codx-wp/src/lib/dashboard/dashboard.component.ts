import { DialogRef } from 'codx-core/public-api';
import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { NotifyDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/notify-drawer/notify-drawer.component';
import { CodxAlertComponent } from 'projects/codx-share/src/lib/components/codx-alert/codx-alert.component';
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
    this.funcID = this.route.snapshot.paramMap.get("funcID");
  }

  onAfterViewInit() {

  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }

  openFormNotify(){
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NotifyDrawerComponent, '', option);
  }

  openFormAlertRule(){
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(CodxAlertComponent,'WP', option);
  }
}
