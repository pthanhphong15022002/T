import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  UIComponent,
} from 'codx-core';

import { RoundService } from '../round.service';
import { CodxAcService } from '../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss', '../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: any;
  constructor(
    inject: Injector,
    private round: RoundService,
    private router: ActivatedRoute
  ) {
    super(inject);
    this.module = 'AC';
    this.layoutModel.toolbarDisplay = true;
    this.layoutModel.toolbarFixed = false;
    this.round.initCache();
    this.router.data.subscribe((res: any) => {
      console.log(res);
    });
  }

  onInit(): void {}

  onAfterViewInit(): void {
    // this.layoutModel.toolbarDisplay = false;
    // this.codxAC.changeToolBar.subscribe((funcID:any)=>{
    //   if (funcID) {
    //     if (funcID === 'ACT') {
    //       this.funcID = funcID;
    //     }
    //   }else{
    //     this.funcID = null;
    //   }
    // })
  }
}
