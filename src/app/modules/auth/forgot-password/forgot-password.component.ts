import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('Error') error: ElementRef;
  formGroup: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  mode = '';
  loginTmp: any;

  // private fields
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationsService: NotificationsService
  ) {
    this.loginTmp = environment.loginTmp;
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.formGroup.controls;
  }

  initForm() {
    this.formGroup = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          //Validators.email,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    const changepwSubscr = this.authService
      .fogotPassword(this.f.email.value)
      .pipe()
      .subscribe((data) => {
        if (!data.isError) {
          this.notificationsService.notify('Kiểm tra tài khoản email!');
        } else {
          //$(this.error.nativeElement).html(data.error);
          this.notificationsService.notify(data.error);
        }
      });
  }
}
