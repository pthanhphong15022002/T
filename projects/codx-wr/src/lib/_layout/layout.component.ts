import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CodxWrService } from '../codx-wr.service';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(inject: Injector, private callfc: CallFuncService, private wrSv: CodxWrService, private changeDetectorRef: ChangeDetectorRef) {
    super(inject);
    this.module = 'WR';
  }
  onInit(): void {}

  onAfterViewInit(): void {}

  menuClick(e){
    console.log('menu: ', e);
  }

  childMenuClick(e){
    this.wrSv.childMenuClick.next(e);
    this.changeDetectorRef.detectChanges();
    console.log('childMenu: ', e);
  }
}
