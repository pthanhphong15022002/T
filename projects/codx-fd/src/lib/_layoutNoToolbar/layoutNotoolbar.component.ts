import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout-notoolbar',
  templateUrl: './layoutNotoolbar.component.html',
  styleUrls: ['./layoutNotoolbar.component.css'],
})
export class LayoutNotoolbar extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private router : Router, 
    private callfc: CallFuncService
    ) {
    super(inject);
    this.getModule();
  }

  onInit(): void { }

  getModule()
  {
    this.module = this.router?.url.split("/")[2].toUpperCase();
  }

  onAfterViewInit(): void {}
}
