import { Component, Injector, OnInit } from '@angular/core';
import { CallFuncService, LayoutBaseComponent, SidebarModel } from 'codx-core';


@Component({
  selector: 'lib-noSubAside',
  templateUrl: './_noSubAside.component.html',
  styleUrls: ['./_noSubAside.component.css']
})
export class NoSubAsideComponent extends LayoutBaseComponent {
  constructor(
    inject: Injector,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = 'HR';
  }

  onInit(): void { }

  onAfterViewInit(): void { }

  
}
