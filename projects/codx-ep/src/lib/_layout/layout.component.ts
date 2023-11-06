import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';


@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector, 
    private callfc: CallFuncService,
    private router: Router
  ) {
    super(inject);
    this.getModule();
  }
  onInit(): void {}

  onAfterViewInit(): void {}
  
  getModule()
  {
    this.module = this.router?.url.split("/")[2].toUpperCase();
  }
  
}
