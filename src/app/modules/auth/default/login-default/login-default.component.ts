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
  Validators,
} from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheRouteReuseStrategy,
  NotificationsService,
  TenantStore,
  UrlUtil,
} from 'codx-core';

@Component({
  selector: 'codx-login',
  templateUrl: './login-default.component.html',
  styleUrls: ['./login-default.component.scss'],
})
export class LoginDefaultComponent implements OnInit, OnDestroy {
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
  @Output() submitEvent = new EventEmitter();
  @Output() submitChangePassEvent = new EventEmitter();
  @Output() submitFirstLoginEvent = new EventEmitter();
  @Output() destroyEven = new EventEmitter();
  @Output() forgotPassEven = new EventEmitter();
  // private fields
  @Input() unsubscribe: Subscription[] = [];
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

  submit() {
    this.submitEvent.emit();
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
