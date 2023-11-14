import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef, LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent{
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private router: Router,
  ) 
  {
    super(inject);
    this.getModule();
  }

  onInit() {}

  getModule()
  {
    this.module = this.router?.url.split("/")[2].toUpperCase();
  }

  override onAfterViewInit(){}
}
