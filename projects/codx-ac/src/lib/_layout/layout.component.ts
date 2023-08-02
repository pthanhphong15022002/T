import {
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AsideComponent, CodxService } from 'codx-core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';

import { CodxShareService } from 'projects/codx-share/src/public-api';
import { BehaviorSubject } from 'rxjs';
import { CodxAcService } from '../codx-ac.service';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private codxAC: CodxAcService
  ) {
    super(inject);

    this.module = 'AC';
  }

  onInit(): void {}
  onAfterViewInit(): void {}
  
  childMenuClick(e) {
    if (e && e?.recID) {
      this.codxAC.childMenuClick.next(e.recID);
    }
  }
}
