import { Component, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent } from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxWsService } from 'projects/codx-ws/src/lib/codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-layout-noaside-ac',
  templateUrl: './layout-noaside-ac.component.html',
  styleUrls: ['./layout-noaside-ac.component.css']
})
export class LayoutNoasideAcComponent extends LayoutBaseComponent {
  constructor(
    inject: Injector,
    private codxCMService: CodxCommonService,
    private codxWsService: CodxWsService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = '';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
  }

  onInit(): void {
    this.codxCMService.hideAside.subscribe((res) => {
      if (res != null) this.setAside(res);
    });
  }

  onAfterViewInit(): void {
    
  }
  
}
