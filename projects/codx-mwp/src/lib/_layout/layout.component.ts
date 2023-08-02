import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, CodxService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';

import { Observable } from 'rxjs';
import { CodxMwpService } from '../codx-mwp.service';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
    dialog!: DialogRef;
  constructor(inject: Injector,
    private callfc: CallFuncService,
    private mwpService : CodxMwpService
    ) {
    super(inject);
    this.module = 'MWP';
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }

  
  childMenuClick(e) {
    this.mwpService.childMenuClick.next(e);
  }
}
