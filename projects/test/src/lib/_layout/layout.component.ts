import { Component, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {

  module: string = 'TM'; // <-- Gán giá trị cho biến Module

  constructor(inject: Injector) {
    super(inject); // <-- khai báo super để inject giá trị vào LayoutBase
  }

  onInit(): void { } // <-- Hàm được triển khai khi kế thừa LayoutBaseComponent tương tự ngOnInit

  onAfterViewInit(): void { } // <-- Hàm được triển khai khi kế thừa LayoutBaseComponent tương tự ngAfterViewInit

}

