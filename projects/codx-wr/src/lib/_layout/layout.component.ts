import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Injector,
} from '@angular/core';
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

  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'WR';
  }
  onInit(): void {}

  onAfterViewInit(): void {}
}
