import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

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
export class ForgotPasswordDefaultComponent implements OnInit, AfterViewInit {
  @ViewChild('Error') error: ElementRef;
  @Input() errorState: ErrorStates = ErrorStates.NotSubmitted;
  @Input() errorStates = ErrorStates;
  @Input() formGroup: FormGroup;
  @Input() f: any;
  @Output() submitEvent = new EventEmitter();
  captChaValid = false;
  enableCaptcha = 0;
  // private fields
  constructor() {
    this.enableCaptcha = environment.captchaEnable;
    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.enableCaptcha == 0) {
      this.captChaValid = true;
    } else {
      let captChaControl = this.formGroup.controls['captCha'];
      captChaControl.valueChanges.subscribe((e) => {
        this.captChaValid = captChaControl.valid;
      });
    }
  }

  submit() {
    this.submitEvent.emit();
  }
}
