import { Observable } from 'rxjs';
import { Component, ViewChild, ElementRef, Injector, ViewEncapsulation } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent, SidebarModel
} from 'codx-core';


@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(inject: Injector,
    private callfc: CallFuncService) {
    super(inject);
    this.layoutModel.toolbarDisplay = true;
  }
  funcID:any = '';
  func:any={};
  submenu:any;
  onInit(): void {
    // this.funcs$.subscribe(res => {
    //   console.log(res);

    // })
  }

  onAfterViewInit(): void {
  }

  
}
