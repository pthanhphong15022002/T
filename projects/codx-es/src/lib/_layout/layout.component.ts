import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  onInit(): void {
  }
  onAfterViewInit(): void {
  }

  module = "ES";
  constructor(
    inject: Injector
  ) {
    super(inject);
    this.codxService.init(this.module);

    this.funcs$  = this.codxService.getFuncs(this.module);
    // this.codxService.getFuncs(this.module).subscribe(res => {
    //   this.funcs = res;
    //   this.funcs$ = of(this.funcs);
    // })
  }

  public contentResized(size: any){
    // if(size){
    //   console.log(JSON.stringify(size));
    // }
  }

}
