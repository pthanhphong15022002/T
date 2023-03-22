import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { IModelShare } from '../interfaces/IModelShare.interface';

@Component({
  selector: 'lib-dropdown-detail',
  templateUrl: './dropdown-detail.component.html',
  styleUrls: ['./dropdown-detail.component.css'],
})
export class DropdownDetailComponent extends UIComponent {
  //#region Constructor
  @Input() modelShares: IModelShare[];
  @Input() formModel: FormModel;

  constructor(private injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {}
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  getIds(): string {
    return this.modelShares.map((d) => d.id).join(';');
  }
  //#endregion
}
