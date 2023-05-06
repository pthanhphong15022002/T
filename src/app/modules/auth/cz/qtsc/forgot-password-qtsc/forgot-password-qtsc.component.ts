import { Component, ElementRef, OnInit, ViewChild, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'qtsc-forgot-password',
  templateUrl: './forgot-password-qtsc.component.html',
  styleUrls: ['./forgot-password-qtsc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordQTSCComponent implements OnInit {
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