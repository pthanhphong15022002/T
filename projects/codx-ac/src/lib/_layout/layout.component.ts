import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
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
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss', '../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: any;
  constructor(
    inject: Injector,
    private round: RoundService,
  ) {
    super(inject);
    this.module = 'AC';
    this.layoutModel.toolbarDisplay = true;
    this.layoutModel.toolbarFixed = false;
    this.round.initCache();
  }

  onInit(): void {
    
  }

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
