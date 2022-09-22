import { ChangeDetectorRef, Component, HostBinding, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { DateTime } from '@syncfusion/ej2-charts';
import {  ApiHttpService, AuthService, CallFuncService, CodxService, CRUDService, DialogData, DialogRef, ScrollComponent, SidebarModel, UIComponent } from 'codx-core';
import { debug } from 'console';
import { NotifyDrawerSliderComponent } from './notify-drawer-slider/notify-drawer-slider.component';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent implements OnInit {
  @HostBinding('class') get class() {
     return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
    }

  constructor(
    public codxService:CodxService,
    private callFc:CallFuncService,
  ) 
  { }

  ngOnInit(): void {
  }


  openFormNotify(){
    let option = new SidebarModel();
    option.Width = '550px';
    this.callFc.openSide(NotifyDrawerSliderComponent, "", option);
  }

}
