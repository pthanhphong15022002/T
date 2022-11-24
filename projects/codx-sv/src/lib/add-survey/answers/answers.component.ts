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
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss'],
})
export class AnswersComponent extends UIComponent implements OnInit, OnChanges {
  @Input() changeModeA: any;
  @Input() formModel: any;
  constructor(private injector: Injector) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['changeModeA']) {
    }
  }

  onInit(): void {}
}
