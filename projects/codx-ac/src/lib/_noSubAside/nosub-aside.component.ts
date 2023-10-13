import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-nosub-aside',
  templateUrl: './nosub-aside.component.html',
  styleUrls: ['./nosub-aside.component.css','../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NosubAsideComponent extends LayoutBaseComponent {
  // toolbar = false;
  childMenu = new BehaviorSubject<any>(null);
  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private detectorRef: ChangeDetectorRef,
  ) { 
    super(inject);
    this.module = 'AC';
  }

  onInit(): void { }

  onAfterViewInit(): void { }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  childMenuClick(e) {
    this.childMenu.next(e.recID);
  }
  menuClick(e) {}
  

}
