import {
  Component,
  HostListener,
  Injector,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogRef,
  LayoutBaseComponent,
} from 'codx-core';

import { RoundService } from '../round.service';
import { CodxAcService } from '../codx-ac.service';
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
    private router: ActivatedRoute,
    private acService: CodxAcService
  ) {
    super(inject);
    this.module = 'AC';
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
