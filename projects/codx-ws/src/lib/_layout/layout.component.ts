import { ViewChild, ViewEncapsulation } from '@angular/core';
import { Component, Injector } from '@angular/core';
import {
  AsideComponent,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';

import { CodxWsService } from '../codx-ws.service';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private hideToolbar: CodxWsService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = 'WS';
  }

  onInit() {}

  onAfterViewInit() {
    this.hideToolbar.SetLayout.subscribe((res) => {
      if (res != null) this.setToolbar(res);
    });
  }

  
}
