import { Component, Injector, OnInit } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
})
export class GeneralInfoComponent extends UIComponent {
  constructor(private inject: Injector) {
    super(inject);
  }

  onInit(): void {}
}
