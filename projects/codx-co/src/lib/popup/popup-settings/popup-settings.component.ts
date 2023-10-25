import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'popup-settings',
  templateUrl: './popup-settings.component.html',
  styleUrls: ['./popup-settings.component.scss'],
})
export class PopupSettingsComponent
  extends UIComponent
  implements AfterViewInit
{
  headerText: string;
  dialog!: DialogRef;
  data: any;

  constructor(
    injector: Injector,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt.data;
  }

  onInit(): void {
    debugger
    const { data } = this.data;
    console.log(data);
  }

  ngAfterViewInit(): void {}

  valueChange(event) {
    console.log(event);
  }
}
