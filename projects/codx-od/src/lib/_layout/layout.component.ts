import { Component, Injector } from '@angular/core';
import {
  LayoutBaseComponent
} from 'codx-core';
import { CodxOdService } from '../codx-od.service';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'OD';
  // override aside = true;
  // override asideFixed = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' ='transparent';
  // override toolbar = false;

  constructor(inject: Injector , private hideToolbar: CodxOdService) {
    super(inject);
  }

  onInit() { }

  onAfterViewInit() {
    this.hideToolbar.SetLayout.subscribe(res => {
      if (res != null)
        this.setToolbar(res);
    })
  }
}
