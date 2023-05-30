import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-group-share',
  templateUrl: './group-share.component.html',
  styleUrls: ['./group-share.component.css'],
})
export class GroupShareComponent extends UIComponent {
  //#region Constructor
  @Input() formModel: FormModel;
  @Input() field: string;
  @Input() labelName: string;
  @Input() label: string;
  @Input() objectType: string;
  @Input() objectId: string;
  @Output() change = new EventEmitter();

  constructor(injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onChange(e): void {
    this.change.emit(e);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
