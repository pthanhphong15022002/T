import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';

import { Observable, of } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private codxCM: CodxCmService,
  ) {
    super(inject);
    this.module = 'CM';
  }
  onInit(): void {
  }

  onAfterViewInit(): void {

  }

  
  childMenuClick(e){
    if(e &&e?.recID){
      this.codxCM.childMenuClick.next(e.recID);
    }
  }
}
