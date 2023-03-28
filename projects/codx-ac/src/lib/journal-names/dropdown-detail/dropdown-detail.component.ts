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
  ids: string;

  constructor(private injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.ids = this.modelShares.map((d) => d.id).join(';');
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
