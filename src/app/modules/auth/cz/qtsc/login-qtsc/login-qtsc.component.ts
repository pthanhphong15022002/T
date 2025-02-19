import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Component({
  selector: 'qtsc-login',
  templateUrl: './login-qtsc.component.html',
  styleUrls: ['./login-qtsc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginQTSCComponent implements OnInit, OnDestroy {
  @ViewChild('Error') error: ElementRef;
  @Input() defaultAuth: any = {
    email: '', // 'admin@demo.com',
    password: '', // 'demo'
  };
  @Input() loginForm: FormGroup;
  @Input() changePassForm: FormGroup;
  @Input() firstLoginForm: FormGroup;
  @Input() fb: FormBuilder;
  @Input() hasError: boolean;
  @Input() returnUrl: string;
  @Input() alerttext: string;
  @Input() sessionID = null;
  @Input() email = null;
  @Input() mode: string;
  @Input() user: any;
  @Input() f: any;
  @Input() c: any;
  @Input() fl: any;
  @Input() isNotADMode: boolean;

  @Output() submitEvent = new EventEmitter<string>();
  @Output() submitChangePassEvent = new EventEmitter();
  @Output() submitFirstLoginEvent = new EventEmitter();
  @Output() destroyEven = new EventEmitter();
  @Output() forgotPassEven = new EventEmitter();
  // private fields
  constructor(private dt: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyEven.emit();
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  valueChange(event: any) {
    if (!event) return;
    let value = event.data;
    this.f.password.patchValue(value);
    this.dt.detectChanges();
  }

  submit(type?: string) {
    this.submitEvent.emit(type);
  }

  submitChangePass() {
    this.submitChangePassEvent.emit();
  }

  submitFirstLogin() {
    this.submitFirstLoginEvent.emit();
  }

  forgotPass() {
    this.forgotPassEven.emit();
  }
}
