import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, UIComponent } from 'codx-core';

import { CodxAcService } from '../codx-ac.service';
import { RoundService } from '../round.service';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss','../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent extends LayoutBaseComponent  {
  dialog!: DialogRef;
  funcID:any;
  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private codxAC: CodxAcService,
    private round: RoundService,
    private detectorRef: ChangeDetectorRef,
  ) {
    super(inject);
    this.module = 'AC';
    this.round.initCache();
  }

  onInit(): void {}
  onAfterViewInit(): void {
    this.codxAC.changeToolBar.subscribe((funcID:any)=>{
      if (funcID) {
        if (funcID === 'ACT') {
          this.funcID = funcID;
        }
      }else{
        this.funcID = null;
      }
    })
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }  
}
