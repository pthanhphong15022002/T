import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormModel, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-group067',
  templateUrl: './group067.component.html',
  styleUrls: ['./group067.component.css'],
})
export class Group067Component extends UIComponent implements OnChanges {
  //#region Constructor
  @Input() formModel: FormModel;
  @Input() formGroup: FormGroup;
  @Input() fieldName: string;
  @Input() subFieldName: string;
  @Input() subLabel: string;
  @Input() vll067: string;
  @Input() data: string;
  @Output() change = new EventEmitter();
  @Output() buttonClick = new EventEmitter();

  constructor(injector: Injector) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      console.log("hi");
    }
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onInputChange(e): void {
    this.change.emit(e);
  }

  onClick(e): void {
    this.buttonClick.emit(e);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
