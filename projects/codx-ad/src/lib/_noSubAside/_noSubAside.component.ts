import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';


@Component({
  selector: 'lib-noSubAside',
  templateUrl: './_noSubAside.component.html',
  styleUrls: ['./_noSubAside.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoSubAsideComponent extends LayoutBaseComponent {
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'AD';
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  
}
