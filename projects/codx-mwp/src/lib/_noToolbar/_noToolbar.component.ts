import { Component, OnInit, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-layoutNoToolbar',
  templateUrl: './_noToolbar.component.html',
  styleUrls: ['./_noToolbar.component.scss'],
})
export class LayoutNoToolbarComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'MWP';
    this.layoutModel.toolbarDisplay=false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  
}
