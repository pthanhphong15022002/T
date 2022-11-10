import { Component, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css']
})
export class OKRComponent extends UIComponent {

  constructor(inject: Injector) {
    super(inject)
   }

  onInit(): void {
    
  }

}
