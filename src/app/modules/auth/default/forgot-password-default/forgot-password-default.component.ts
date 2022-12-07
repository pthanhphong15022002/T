import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'codx-forgot-password',
  templateUrl: './forgot-password-default.component.html',
  styleUrls: ['./forgot-password-default.component.scss'],
})
export class ForgotPasswordDefaultComponent implements OnInit {
  @ViewChild('Error') error: ElementRef;
  @Input() errorState: ErrorStates = ErrorStates.NotSubmitted;
  @Input() errorStates = ErrorStates;
  @Input() formGroup: FormGroup;
  @Input() f: any;
  @Output() submitEvent = new EventEmitter();

  // private fields
  constructor() {}

  ngOnInit(): void {}

  submit() {
    this.submitEvent.emit();
  }
}
