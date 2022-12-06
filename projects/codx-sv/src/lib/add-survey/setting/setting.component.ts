import {
  Component,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent extends UIComponent implements OnInit, OnChanges {
  constructor(private injector: Injector) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['changeModeS']) {
    }
  }

  onInit(): void {}
}
