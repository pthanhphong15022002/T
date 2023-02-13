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
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-login',
  templateUrl: './login-default.component.html',
  styleUrls: ['./login-default.component.scss'],
})
export class LoginDefaultComponent implements OnInit, OnDestroy {
  environment = environment;
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
  @Output() submitEvent = new EventEmitter<string>();
  @Output() submitChangePassEvent = new EventEmitter();
  @Output() submitFirstLoginEvent = new EventEmitter();
  @Output() destroyEven = new EventEmitter();
  @Output() forgotPassEven = new EventEmitter();

  externalLogin = false;
  externalLoginCol = '';
  externalLoginShowText = true;
  
  // private fields
  constructor(private dt: ChangeDetectorRef) {}

  ngOnInit(): void {
    // if (
    //   environment.saas == 1 &&
    //   (environment.externalLogin.amazonId ||
    //     environment.externalLogin.facebookId ||
    //     environment.externalLogin.googleId ||
    //     environment.externalLogin.microsoftId)
    // ) {
    //   this.externalLogin = true;
    //   let iCol = 0;
    //   if (environment.externalLogin.amazonId) iCol += 1;
    //   if (environment.externalLogin.facebookId) iCol += 1;
    //   if (environment.externalLogin.googleId) iCol += 1;
    //   if (environment.externalLogin.microsoftId) iCol += 1;

    //   this.externalLoginShowText = iCol <= 2;
    //   this.externalLoginCol = 'col-md-' + (12/iCol);
    // }
  }

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
